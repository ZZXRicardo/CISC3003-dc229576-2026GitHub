const crypto = require('crypto');

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function generateVerificationCode(length = 6) {
  let code = '';
  while (code.length < length) {
    code += crypto.randomInt(0, 10).toString();
  }
  return code;
}

function hashToken(token) {
  return crypto.createHash('sha256').update(String(token || '')).digest('hex');
}

function tokenPreview(token) {
  const value = String(token || '');
  if (!value) return '';
  if (value.length <= 12) return value;
  return `${value.slice(0, 6)}...${value.slice(-6)}`;
}

function tokenExpiry(hours = 24) {
  const d = new Date();
  d.setHours(d.getHours() + hours);
  return d.toISOString();
}

function isExpired(expiresAt) {
  return new Date(expiresAt) < new Date();
}

module.exports = {
  generateToken,
  generateVerificationCode,
  hashToken,
  tokenPreview,
  tokenExpiry,
  isExpired
};
