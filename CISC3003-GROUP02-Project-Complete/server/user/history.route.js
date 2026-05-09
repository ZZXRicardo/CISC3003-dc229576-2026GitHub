const express = require('express');
const db = require('../database/db');
const { requireLogin } = require('../auth/auth.middleware');

const router = express.Router();

router.get('/', requireLogin, (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit || '50', 10), 1), 200);
  const rows = db
    .prepare(
      `SELECT
         h.*,
         CASE
           WHEN h.item_type = 'programme'
             THEN (SELECT university || ' — ' || name FROM programmes WHERE id = h.item_id)
           WHEN h.item_type = 'job'
             THEN (SELECT company || ' — ' || title FROM jobs WHERE id = h.item_id)
           ELSE COALESCE(h.page_path, '')
         END AS label
       FROM history h
       WHERE user_id = ?
       ORDER BY viewed_at DESC
       LIMIT ?`
    )
    .all(req.session.userId, limit);
  res.json({ items: rows });
});

router.post('/', requireLogin, (req, res) => {
  const { itemType, itemId, pagePath } = req.body || {};
  if (!itemType) return res.status(400).json({ error: 'itemType required.' });

  const normId = itemId ? parseInt(itemId, 10) : null;
  const normPath = pagePath ? String(pagePath).slice(0, 200) : null;

  // Simple dedup: skip if same item logged within last 5 minutes.
  const recent = db
    .prepare(
      `SELECT id FROM history
       WHERE user_id = ? AND item_type = ?
         AND COALESCE(item_id, 0) = COALESCE(?, 0)
         AND COALESCE(page_path, '') = COALESCE(?, '')
         AND viewed_at > datetime('now', '-5 minutes')`
    )
    .get(req.session.userId, itemType, normId, normPath);

  if (recent) return res.json({ ok: true, skipped: true });

  db.prepare(
    'INSERT INTO history (user_id, item_type, item_id, page_path) VALUES (?, ?, ?, ?)'
  ).run(req.session.userId, itemType, normId, normPath);

  res.json({ ok: true });
});

router.delete('/', requireLogin, (req, res) => {
  db.prepare('DELETE FROM history WHERE user_id = ?').run(req.session.userId);
  res.json({ ok: true });
});

module.exports = router;
