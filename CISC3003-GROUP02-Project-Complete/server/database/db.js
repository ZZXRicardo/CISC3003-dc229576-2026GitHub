const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'cornerstone.sqlite');
const db = new DatabaseSync(dbPath);
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

function columnExists(table, column) {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all();
  return rows.some((row) => row.name === column);
}

function ensureColumn(table, column, definition) {
  if (!columnExists(table, column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT,
      is_verified INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS verifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      code TEXT,
      expires_at DATETIME NOT NULL,
      used_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      code TEXT,
      expires_at DATETIME NOT NULL,
      used_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS programmes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      university TEXT NOT NULL,
      region TEXT NOT NULL,
      tier TEXT NOT NULL,
      duration TEXT,
      tuition TEXT,
      highlight TEXT,
      url TEXT
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      role_type TEXT NOT NULL,
      location TEXT,
      level TEXT,
      highlight TEXT,
      url TEXT
    );

    CREATE TABLE IF NOT EXISTS schools (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      country TEXT,
      region TEXT,
      city TEXT,
      website TEXT,
      overview TEXT,
      ranking_tier TEXT,
      application_difficulty TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS school_programmes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      school_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      degree_type TEXT,
      study_mode TEXT,
      focus_area TEXT,
      duration TEXT,
      tuition TEXT,
      language_requirement TEXT,
      gpa_requirement TEXT,
      deadline TEXT,
      application_requirements TEXT,
      url TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (school_id) REFERENCES schools(id),
      UNIQUE(school_id, name)
    );

    CREATE TABLE IF NOT EXISTS shortlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      item_type TEXT NOT NULL,
      item_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, item_type, item_id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      item_type TEXT NOT NULL,
      item_id INTEGER,
      page_path TEXT,
      viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS email_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      email_type TEXT NOT NULL,
      recipient TEXT NOT NULL,
      subject TEXT NOT NULL,
      provider TEXT NOT NULL,
      token_hash TEXT,
      token_preview TEXT,
      delivery_status TEXT NOT NULL DEFAULT 'pending',
      verification_status TEXT NOT NULL DEFAULT 'not_applicable',
      message_id TEXT,
      provider_response TEXT,
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      sent_at DATETIME,
      verified_at DATETIME,
      last_checked_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
}

function seedFromJson(table, columns, file) {
  const count = db.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get().c;
  if (count > 0) return 0;
  const filePath = path.join(__dirname, 'seed', file);
  if (!fs.existsSync(filePath)) return 0;
  const items = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const placeholders = columns.map((c) => '@' + c).join(', ');
  const insert = db.prepare(
    `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`
  );
  db.exec('BEGIN');
  try {
    for (const row of items) {
      const bound = {};
      for (const col of columns) bound[col] = row[col] ?? null;
      insert.run(bound);
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
  return items.length;
}

createTables();
ensureColumn('verifications', 'code', 'TEXT');
ensureColumn('resets', 'code', 'TEXT');
const seededProgrammes = seedFromJson(
  'programmes',
  ['name', 'university', 'region', 'tier', 'duration', 'tuition', 'highlight', 'url'],
  'programmes.seed.json'
);
const seededJobs = seedFromJson(
  'jobs',
  ['title', 'company', 'role_type', 'location', 'level', 'highlight', 'url'],
  'jobs.seed.json'
);
if (seededProgrammes) console.log(`Seeded ${seededProgrammes} programmes.`);
if (seededJobs) console.log(`Seeded ${seededJobs} jobs.`);

module.exports = db;
