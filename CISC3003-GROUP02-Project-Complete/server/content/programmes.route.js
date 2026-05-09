const express = require('express');
const db = require('../database/db');

const router = express.Router();

router.get('/', (req, res) => {
  const q = String(req.query.q || '').trim();
  const region = String(req.query.region || '').trim();
  const tier = String(req.query.tier || '').trim();

  const conditions = [];
  const params = {};

  if (q) {
    conditions.push(
      '(LOWER(name) LIKE @q OR LOWER(university) LIKE @q OR LOWER(highlight) LIKE @q)'
    );
    params.q = `%${q.toLowerCase()}%`;
  }
  if (region) {
    conditions.push('region = @region');
    params.region = region;
  }
  if (tier) {
    conditions.push('tier = @tier');
    params.tier = tier;
  }

  let sql = 'SELECT * FROM programmes';
  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql +=
    " ORDER BY CASE tier WHEN 'T1' THEN 1 WHEN 'T2' THEN 2 WHEN 'T3' THEN 3 ELSE 4 END, university";

  const rows = db.prepare(sql).all(params);
  res.json({ items: rows, total: rows.length });
});

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const row = db.prepare('SELECT * FROM programmes WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ error: 'Programme not found.' });
  res.json({ item: row });
});

module.exports = router;
