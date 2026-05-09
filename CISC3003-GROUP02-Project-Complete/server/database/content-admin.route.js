const express = require('express');
const db = require('./db');
const { requireLogin } = require('../auth/auth.middleware');

const router = express.Router();

function trimOrNull(value, max = 2000) {
  if (value == null) return null;
  const text = String(value).trim();
  return text ? text.slice(0, max) : null;
}

router.get('/schema', requireLogin, (req, res) => {
  res.json({
    entities: {
      schools: {
        required: ['name'],
        optional: ['country', 'region', 'city', 'website', 'overview', 'rankingTier', 'applicationDifficulty']
      },
      schoolProgrammes: {
        required: ['schoolId', 'name'],
        optional: [
          'degreeType',
          'studyMode',
          'focusArea',
          'duration',
          'tuition',
          'languageRequirement',
          'gpaRequirement',
          'deadline',
          'applicationRequirements',
          'url',
          'description'
        ]
      }
    }
  });
});

router.get('/schools', requireLogin, (req, res) => {
  const rows = db.prepare('SELECT * FROM schools ORDER BY name').all();
  res.json({ items: rows, total: rows.length });
});

router.get('/school-programmes', requireLogin, (req, res) => {
  const rows = db
    .prepare(
      `SELECT sp.*, s.name AS school_name
       FROM school_programmes sp
       JOIN schools s ON s.id = sp.school_id
       ORDER BY s.name, sp.name`
    )
    .all();
  res.json({ items: rows, total: rows.length });
});

router.post('/intake/schools', requireLogin, (req, res) => {
  const { name, country, region, city, website, overview, rankingTier, applicationDifficulty } = req.body || {};
  const normalizedName = trimOrNull(name, 200);

  if (!normalizedName) {
    return res.status(400).json({ error: 'School name is required.' });
  }

  const existing = db.prepare('SELECT id FROM schools WHERE name = ?').get(normalizedName);
  if (existing) {
    return res.status(409).json({ error: 'This school already exists.' });
  }

  const result = db
    .prepare(
      `INSERT INTO schools (
        name, country, region, city, website, overview, ranking_tier, application_difficulty
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      normalizedName,
      trimOrNull(country, 120),
      trimOrNull(region, 120),
      trimOrNull(city, 120),
      trimOrNull(website, 500),
      trimOrNull(overview, 4000),
      trimOrNull(rankingTier, 60),
      trimOrNull(applicationDifficulty, 60)
    );

  const school = db.prepare('SELECT * FROM schools WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({
    ok: true,
    message: 'School record created. You can now add related programmes later.',
    item: school
  });
});

router.post('/intake/programmes', requireLogin, (req, res) => {
  const {
    schoolId,
    name,
    degreeType,
    studyMode,
    focusArea,
    duration,
    tuition,
    languageRequirement,
    gpaRequirement,
    deadline,
    applicationRequirements,
    url,
    description
  } = req.body || {};

  const normalizedSchoolId = parseInt(schoolId, 10);
  const normalizedName = trimOrNull(name, 200);

  if (!normalizedSchoolId) {
    return res.status(400).json({ error: 'schoolId is required.' });
  }
  if (!normalizedName) {
    return res.status(400).json({ error: 'Programme name is required.' });
  }

  const school = db.prepare('SELECT id, name FROM schools WHERE id = ?').get(normalizedSchoolId);
  if (!school) {
    return res.status(404).json({ error: 'School not found.' });
  }

  const existing = db
    .prepare('SELECT id FROM school_programmes WHERE school_id = ? AND name = ?')
    .get(normalizedSchoolId, normalizedName);
  if (existing) {
    return res.status(409).json({ error: 'This programme already exists for the selected school.' });
  }

  const result = db
    .prepare(
      `INSERT INTO school_programmes (
        school_id, name, degree_type, study_mode, focus_area, duration, tuition,
        language_requirement, gpa_requirement, deadline, application_requirements, url, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      normalizedSchoolId,
      normalizedName,
      trimOrNull(degreeType, 80),
      trimOrNull(studyMode, 80),
      trimOrNull(focusArea, 120),
      trimOrNull(duration, 120),
      trimOrNull(tuition, 120),
      trimOrNull(languageRequirement, 200),
      trimOrNull(gpaRequirement, 200),
      trimOrNull(deadline, 120),
      trimOrNull(applicationRequirements, 4000),
      trimOrNull(url, 500),
      trimOrNull(description, 4000)
    );

  const programme = db
    .prepare(
      `SELECT sp.*, s.name AS school_name
       FROM school_programmes sp
       JOIN schools s ON s.id = sp.school_id
       WHERE sp.id = ?`
    )
    .get(result.lastInsertRowid);

  res.status(201).json({
    ok: true,
    message: 'Programme record created. You can continue adding school and programme content later.',
    item: programme
  });
});

module.exports = router;
