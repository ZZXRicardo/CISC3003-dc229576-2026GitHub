const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../database/db');
const {
  generateToken,
  generateVerificationCode,
  tokenExpiry,
  isExpired
} = require('./tokens');
const { getProviderName, sendVerificationEmail, sendPasswordResetEmail } = require('./mailer');
const {
  createEmailLog,
  markEmailLogSent,
  markEmailLogFailed,
  upsertVerificationStatus
} = require('./email-logs');
const { requireLogin } = require('./auth.middleware');
const { authLimiter } = require('./rate-limit');

const router = express.Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function appUrl() {
  return process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;
}

async function issueVerificationEmail({ userId, email, displayName }) {
  db.prepare('DELETE FROM verifications WHERE user_id = ? AND used_at IS NULL').run(userId);

  const token = generateToken();
  const code = generateVerificationCode(6);
  db.prepare('INSERT INTO verifications (user_id, token, code, expires_at) VALUES (?, ?, ?, ?)').run(
    userId,
    token,
    code,
    tokenExpiry(24)
  );

  const link = `${appUrl()}/api/auth/verify?token=${token}`;
  const logId = createEmailLog({
    userId,
    emailType: 'verification',
    recipient: email,
    subject: 'Verify your Cornerstone account',
    provider: getProviderName(),
    token
  });

  try {
    const mailResult = await sendVerificationEmail(email, displayName, link, code);
    markEmailLogSent(logId, mailResult);
    return { ok: true, delivery: mailResult && mailResult.mocked ? 'mocked' : 'sent' };
  } catch (err) {
    markEmailLogFailed(logId, err);
    console.error('Failed to send verification email:', err.message);
    return { ok: false, error: err };
  }
}

router.post('/signup', authLimiter, async (req, res) => {
  const { email, password, displayName } = req.body || {};
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'A valid email is required.' });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }
  const normalized = email.toLowerCase().trim();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalized);
  if (existing) {
    return res.status(409).json({ error: 'This email is already registered.' });
  }

  const hash = await bcrypt.hash(password, 12);
  const result = db
    .prepare('INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)')
    .run(normalized, hash, displayName ? String(displayName).trim().slice(0, 80) : null);

  await issueVerificationEmail({
    userId: result.lastInsertRowid,
    email: normalized,
    displayName
  });

  res.json({
    ok: true,
    message: 'Account created. Check your email to verify your account before logging in.'
  });
});

router.get('/verify', (req, res) => {
  const { token } = req.query;
  if (!token) return res.redirect('/verify.html?status=error');

  const record = db.prepare('SELECT * FROM verifications WHERE token = ?').get(token);
  if (!record) {
    upsertVerificationStatus(token, 'invalid');
    return res.redirect('/verify.html?status=error');
  }
  if (record.used_at) {
    upsertVerificationStatus(token, 'used');
    return res.redirect('/verify.html?status=used');
  }
  if (isExpired(record.expires_at)) {
    upsertVerificationStatus(token, 'expired');
    return res.redirect('/verify.html?status=expired');
  }

  db.prepare('UPDATE users SET is_verified = 1 WHERE id = ?').run(record.user_id);
  db.prepare('UPDATE verifications SET used_at = CURRENT_TIMESTAMP WHERE id = ?').run(record.id);
  upsertVerificationStatus(token, 'verified');
  res.redirect('/verify.html?status=success');
});

router.post('/verify-code', authLimiter, (req, res) => {
  const { email, code } = req.body || {};
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'A valid email is required.' });
  }
  if (!code || !/^\d{6}$/.test(String(code).trim())) {
    return res.status(400).json({ error: 'A valid 6-digit verification code is required.' });
  }

  const normalized = String(email).toLowerCase().trim();
  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(normalized);
  if (!user) {
    return res.status(400).json({ error: 'Invalid verification email or code.' });
  }

  const record = db
    .prepare(
      `SELECT *
       FROM verifications
       WHERE user_id = ? AND code = ?
       ORDER BY id DESC
       LIMIT 1`
    )
    .get(user.id, String(code).trim());

  if (!record) {
    return res.status(400).json({ error: 'Invalid verification email or code.' });
  }
  if (record.used_at) {
    upsertVerificationStatus(record.token, 'used');
    return res.status(400).json({ error: 'This verification code has already been used.' });
  }
  if (isExpired(record.expires_at)) {
    upsertVerificationStatus(record.token, 'expired');
    return res.status(400).json({ error: 'This verification code has expired.' });
  }

  db.prepare('UPDATE users SET is_verified = 1 WHERE id = ?').run(record.user_id);
  db.prepare('UPDATE verifications SET used_at = CURRENT_TIMESTAMP WHERE id = ?').run(record.id);
  upsertVerificationStatus(record.token, 'verified');

  res.json({ ok: true, message: 'Email verified successfully. You can now log in.' });
});

router.post('/login', authLimiter, async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).toLowerCase().trim());
  if (!user) return res.status(401).json({ error: 'Invalid credentials.' });

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(401).json({ error: 'Invalid credentials.' });

  if (!user.is_verified) {
    return res.status(403).json({ error: 'Please verify your email before logging in.' });
  }

  req.session.userId = user.id;
  res.json({
    ok: true,
    user: { id: user.id, email: user.email, displayName: user.display_name }
  });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('cornerstone.sid');
    res.json({ ok: true });
  });
});

router.get('/me', (req, res) => {
  if (!req.session.userId) return res.json({ user: null });
  const user = db
    .prepare('SELECT id, email, display_name FROM users WHERE id = ?')
    .get(req.session.userId);
  if (!user) return res.json({ user: null });
  res.json({ user: { id: user.id, email: user.email, displayName: user.display_name } });
});

router.get('/email-logs', requireLogin, (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
  const rows = db
    .prepare(
      `SELECT
         id,
         email_type AS emailType,
         recipient,
         subject,
         provider,
         token_preview AS tokenPreview,
         delivery_status AS deliveryStatus,
         verification_status AS verificationStatus,
         message_id AS messageId,
         provider_response AS providerResponse,
         error_message AS errorMessage,
         created_at AS createdAt,
         sent_at AS sentAt,
         verified_at AS verifiedAt,
         last_checked_at AS lastCheckedAt
       FROM email_logs
       WHERE user_id = ?
       ORDER BY id DESC
       LIMIT ?`
    )
    .all(req.session.userId, limit);
  res.json({ items: rows });
});

router.post('/resend-verification', authLimiter, async (req, res) => {
  const { email } = req.body || {};
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'A valid email is required.' });
  }

  const normalized = String(email).toLowerCase().trim();
  const user = db
    .prepare('SELECT id, email, display_name, is_verified FROM users WHERE email = ?')
    .get(normalized);

  if (!user || user.is_verified) {
    return res.json({
      ok: true,
      message: 'If this account exists and still needs verification, a new verification email has been sent.'
    });
  }

  await issueVerificationEmail({
    userId: user.id,
    email: user.email,
    displayName: user.display_name
  });

  res.json({
    ok: true,
    message: 'If this account exists and still needs verification, a new verification email has been sent.'
  });
});

router.post('/forgot', authLimiter, async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email required.' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).toLowerCase().trim());
  if (user) {
    const token = generateToken();
    const code = generateVerificationCode(6);
    db.prepare('DELETE FROM resets WHERE user_id = ? AND used_at IS NULL').run(user.id);
    db.prepare('INSERT INTO resets (user_id, token, code, expires_at) VALUES (?, ?, ?, ?)').run(
      user.id,
      token,
      code,
      tokenExpiry(24)
    );
    const link = `${appUrl()}/reset.html?token=${token}`;
    const codeEntryLink = `${appUrl()}/reset.html?email=${encodeURIComponent(user.email)}`;
    const logId = createEmailLog({
      userId: user.id,
      emailType: 'password_reset',
      recipient: user.email,
      subject: 'Reset your Cornerstone password',
      provider: getProviderName(),
      token,
      verificationStatus: 'not_applicable'
    });
    try {
      const mailResult = await sendPasswordResetEmail(
        user.email,
        user.display_name,
        link,
        code,
        codeEntryLink
      );
      markEmailLogSent(logId, mailResult);
    } catch (err) {
      markEmailLogFailed(logId, err);
      console.error('Failed to send reset email:', err.message);
    }
  }
  res.json({
    ok: true,
    message: 'If that email has an account, a password reset link has been sent.'
  });
});

router.post('/reset', authLimiter, async (req, res) => {
  const { token, email, code, newPassword } = req.body || {};
  const hasToken = !!token;
  const hasCodeFlow = !!email || !!code;
  if (!newPassword) {
    return res.status(400).json({ error: 'New password is required.' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }
  let record = null;

  if (hasToken) {
    record = db.prepare('SELECT * FROM resets WHERE token = ?').get(token);
  } else if (hasCodeFlow) {
    if (!EMAIL_RE.test(String(email || '').trim())) {
      return res.status(400).json({ error: 'A valid email is required.' });
    }
    if (!/^\d{6}$/.test(String(code || '').trim())) {
      return res.status(400).json({ error: 'A valid 6-digit reset code is required.' });
    }
    const user = db
      .prepare('SELECT id FROM users WHERE email = ?')
      .get(String(email).toLowerCase().trim());
    if (!user) return res.status(400).json({ error: 'Invalid or expired reset request.' });
    record = db
      .prepare(
        `SELECT *
         FROM resets
         WHERE user_id = ? AND code = ?
         ORDER BY id DESC
         LIMIT 1`
      )
      .get(user.id, String(code).trim());
  } else {
    return res.status(400).json({ error: 'Reset token or reset code is required.' });
  }

  if (!record) return res.status(400).json({ error: 'Invalid or expired reset request.' });
  if (record.used_at) return res.status(400).json({ error: 'This reset request has already been used.' });
  if (isExpired(record.expires_at)) return res.status(400).json({ error: 'This reset request has expired.' });

  const hash = await bcrypt.hash(newPassword, 12);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, record.user_id);
  db.prepare('UPDATE resets SET used_at = CURRENT_TIMESTAMP WHERE id = ?').run(record.id);

  res.json({ ok: true, message: 'Password updated. Please log in with your new password.' });
});

module.exports = router;
