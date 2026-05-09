const express = require('express');
const db = require('../database/db');
const { requireLogin } = require('../auth/auth.middleware');

const router = express.Router();

function validItemType(t) {
  return t === 'programme' || t === 'job';
}

router.get('/', requireLogin, (req, res) => {
  const userId = req.session.userId;
  const programmes = db
    .prepare(
      `SELECT s.id AS shortlist_id, s.created_at, p.*
       FROM shortlists s
       JOIN programmes p ON p.id = s.item_id
       WHERE s.user_id = ? AND s.item_type = 'programme'
       ORDER BY s.created_at DESC`
    )
    .all(userId);
  const jobs = db
    .prepare(
      `SELECT s.id AS shortlist_id, s.created_at, j.*
       FROM shortlists s
       JOIN jobs j ON j.id = s.item_id
       WHERE s.user_id = ? AND s.item_type = 'job'
       ORDER BY s.created_at DESC`
    )
    .all(userId);
  res.json({ programmes, jobs });
});

router.get('/ids', requireLogin, (req, res) => {
  const rows = db
    .prepare('SELECT item_type, item_id FROM shortlists WHERE user_id = ?')
    .all(req.session.userId);
  const programmes = rows.filter((r) => r.item_type === 'programme').map((r) => r.item_id);
  const jobs = rows.filter((r) => r.item_type === 'job').map((r) => r.item_id);
  res.json({ programmes, jobs });
});

router.post('/', requireLogin, (req, res) => {
  const { itemType, itemId } = req.body || {};
  if (!validItemType(itemType)) return res.status(400).json({ error: 'Invalid item type.' });
  const id = parseInt(itemId, 10);
  if (!id) return res.status(400).json({ error: 'Invalid item id.' });

  const table = itemType === 'programme' ? 'programmes' : 'jobs';
  const exists = db.prepare(`SELECT id FROM ${table} WHERE id = ?`).get(id);
  if (!exists) return res.status(404).json({ error: 'Item not found.' });

  const already = db
    .prepare('SELECT id FROM shortlists WHERE user_id = ? AND item_type = ? AND item_id = ?')
    .get(req.session.userId, itemType, id);
  if (already) return res.json({ ok: true, already: true });

  db.prepare('INSERT INTO shortlists (user_id, item_type, item_id) VALUES (?, ?, ?)').run(
    req.session.userId,
    itemType,
    id
  );
  res.json({ ok: true });
});

router.delete('/', requireLogin, (req, res) => {
  const { itemType, itemId } = req.body || {};
  if (!validItemType(itemType)) return res.status(400).json({ error: 'Invalid item type.' });
  const id = parseInt(itemId, 10);
  if (!id) return res.status(400).json({ error: 'Invalid item id.' });
  db.prepare(
    'DELETE FROM shortlists WHERE user_id = ? AND item_type = ? AND item_id = ?'
  ).run(req.session.userId, itemType, id);
  res.json({ ok: true });
});

module.exports = router;
