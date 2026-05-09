const db = require('../database/db');
const { hashToken, tokenPreview } = require('./tokens');

function createEmailLog({ userId = null, emailType, recipient, subject, provider, token = '', verificationStatus }) {
  const result = db.prepare(
    `INSERT INTO email_logs (
      user_id, email_type, recipient, subject, provider, token_hash, token_preview, verification_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    userId,
    emailType,
    recipient,
    subject,
    provider,
    token ? hashToken(token) : null,
    token ? tokenPreview(token) : null,
    verificationStatus || (emailType === 'verification' ? 'pending' : 'not_applicable')
  );
  return result.lastInsertRowid;
}

function markEmailLogSent(logId, result) {
  const deliveryStatus = result && result.mocked ? 'mocked' : 'sent';
  db.prepare(
    `UPDATE email_logs
     SET delivery_status = ?, message_id = ?, provider_response = ?, sent_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).run(
    deliveryStatus,
    result && result.messageId ? String(result.messageId) : null,
    result && result.response ? String(result.response).slice(0, 2000) : null,
    logId
  );
}

function markEmailLogFailed(logId, error) {
  db.prepare(
    `UPDATE email_logs
     SET delivery_status = 'failed', error_message = ?
     WHERE id = ?`
  ).run(error ? String(error.message || error).slice(0, 2000) : 'Unknown email failure', logId);
}

function upsertVerificationStatus(token, status) {
  const tokenHash = hashToken(token);
  const existing = db
    .prepare(
      `SELECT id
       FROM email_logs
       WHERE email_type = 'verification' AND token_hash = ?
       ORDER BY id DESC
       LIMIT 1`
    )
    .get(tokenHash);

  if (existing) {
    db.prepare(
      `UPDATE email_logs
       SET verification_status = ?,
           last_checked_at = CURRENT_TIMESTAMP,
           verified_at = CASE WHEN ? = 'verified' THEN CURRENT_TIMESTAMP ELSE verified_at END
       WHERE id = ?`
    ).run(status, status, existing.id);
    return existing.id;
  }

  const result = db.prepare(
    `INSERT INTO email_logs (
      email_type, recipient, subject, provider, token_hash, token_preview, delivery_status, verification_status, last_checked_at, verified_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP,
      CASE WHEN ? = 'verified' THEN CURRENT_TIMESTAMP ELSE NULL END
    )`
  ).run(
    'verification',
    'unknown',
    'Verification link check',
    'unknown',
    tokenHash,
    tokenPreview(token),
    'unknown',
    status,
    status
  );
  return result.lastInsertRowid;
}

module.exports = {
  createEmailLog,
  markEmailLogSent,
  markEmailLogFailed,
  upsertVerificationStatus
};
