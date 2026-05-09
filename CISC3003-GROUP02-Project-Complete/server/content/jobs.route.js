const express = require('express');
const db = require('../database/db');

const router = express.Router();

router.get('/', (req, res) => {
  const q = String(req.query.q || '').trim();
  const role = String(req.query.role || '').trim();
  const company = String(req.query.company || '').trim();
  const location = String(req.query.location || '').trim();

  const conditions = [];
  const params = {};

  if (q) {
    conditions.push(
      '(LOWER(title) LIKE @q OR LOWER(company) LIKE @q OR LOWER(highlight) LIKE @q)'
    );
    params.q = `%${q.toLowerCase()}%`;
  }
  if (role) {
    conditions.push('role_type = @role');
    params.role = role;
  }
  if (company) {
    conditions.push('LOWER(company) LIKE @company');
    params.company = `%${company.toLowerCase()}%`;
  }
  if (location) {
    conditions.push('LOWER(location) LIKE @location');
    params.location = `%${location.toLowerCase()}%`;
  }

  let sql = 'SELECT * FROM jobs';
  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY role_type, company, title';

  const rows = db.prepare(sql).all(params);
  res.json({ items: rows, total: rows.length });
});

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const row = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ error: 'Job not found.' });
  res.json({ item: row });
});

module.exports = router;
