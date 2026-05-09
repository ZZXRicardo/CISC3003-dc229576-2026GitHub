require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');

require('../database/db');

const authRoutes = require('../auth/auth.route');
const chatRoutes = require('../ai/chat.route');
const programmesRoutes = require('../content/programmes.route');
const jobsRoutes = require('../content/jobs.route');
const shortlistRoutes = require('../user/shortlist.route');
const historyRoutes = require('../user/history.route');
const databaseAdminRoutes = require('../database/content-admin.route');

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const IS_PROD = process.env.NODE_ENV === 'production';

app.set('trust proxy', 1);
app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    name: 'cornerstone.sid',
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: IS_PROD,
      maxAge: 1000 * 60 * 60 * 24 * 14
    }
  })
);

app.get('/api/healthz', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/programmes', programmesRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/shortlist', shortlistRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/database', databaseAdminRoutes);

const frontendPath = path.join(__dirname, '..', '..', 'public');
app.use(
  express.static(frontendPath, {
    extensions: ['html'],
    etag: IS_PROD,
    lastModified: true,
    setHeaders(res, filePath) {
      if (!IS_PROD && /\.(html|css|js)$/i.test(filePath)) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    }
  })
);

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'cisc3003-IndAssgn.html'));
});

app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.status(404).sendFile(path.join(frontendPath, 'cisc3003-IndAssgn.html'));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

app.listen(PORT, () => {
  console.log(`Cornerstone backend listening on http://localhost:${PORT}`);
});
