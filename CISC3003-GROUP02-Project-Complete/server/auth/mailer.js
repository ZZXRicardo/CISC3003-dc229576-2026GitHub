const nodemailer = require('nodemailer');

let transporter = null;

function getProviderName() {
  if (process.env.EMAIL_PROVIDER) return process.env.EMAIL_PROVIDER;
  return process.env.SMTP_HOST ? 'smtp' : 'mock';
}

function getSmtpConfig() {
  const provider = getProviderName();

  if (provider === 'gmail') {
    return {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '465', 10),
      secure: true,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 15000
    };
  }

  if (!process.env.SMTP_HOST) return null;

  return {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: true,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000
  };
}

function getTransporter() {
  if (transporter) return transporter;
  const config = getSmtpConfig();
  if (!config) return null;
  transporter = nodemailer.createTransport(config);
  return transporter;
}

async function sendMail({ to, subject, html, text }) {
  const from = process.env.MAIL_FROM || 'Cornerstone <no-reply@cornerstone.local>';
  const t = getTransporter();
  if (!t) {
    console.log('\n========= MOCK EMAIL =========');
    console.log(`From: ${from}`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('------------------------------');
    console.log(text);
    console.log('==============================\n');
    return { mocked: true, provider: getProviderName(), messageId: null, response: 'mock-email-console' };
  }
  const info = await t.sendMail({ from, to, subject, html, text });
  return {
    mocked: false,
    provider: getProviderName(),
    messageId: info && info.messageId ? info.messageId : null,
    response: info && info.response ? info.response : null,
    accepted: info && info.accepted ? info.accepted : [],
    rejected: info && info.rejected ? info.rejected : []
  };
}

async function sendVerificationEmail(to, displayName, link, code) {
  const name = displayName || 'there';
  return sendMail({
    to,
    subject: 'Verify your Cornerstone account',
    text:
      `Hi ${name},\n\n` +
      `Welcome to Cornerstone.\n\n` +
      `Verify your email using the link below:\n${link}\n\n` +
      `Or use this 6-digit verification code:\n${code}\n\n` +
      `Both expire in 24 hours.\n\n` +
      `-Cornerstone`,
    html:
      `<p>Hi ${name},</p>` +
      `<p>Welcome to Cornerstone.</p>` +
      `<p>Verify your email using the link below:</p>` +
      `<p><a href="${link}">${link}</a></p>` +
      `<p>Or use this 6-digit verification code:</p>` +
      `<p style="font-size:24px;font-weight:700;letter-spacing:0.2em;">${code}</p>` +
      `<p>Both expire in 24 hours.</p>` +
      `<p>-Cornerstone</p>`
  });
}

async function sendPasswordResetEmail(to, displayName, link, code, codeEntryLink) {
  const name = displayName || 'there';
  return sendMail({
    to,
    subject: 'Reset your Cornerstone password',
    text:
      `Hi ${name},\n\n` +
      `You requested to reset your password.\n\n` +
      `Open the reset page:\n${codeEntryLink}\n\n` +
      `Or use this direct reset link:\n${link}\n\n` +
      `Reset code:\n${code}\n\n` +
      `If you did not request this, ignore this email. This link expires in 24 hours.\n\n` +
      `-Cornerstone`,
    html:
      `<p>Hi ${name},</p>` +
      `<p>You requested to reset your password.</p>` +
      `<p>Open the reset page and enter the code below:</p>` +
      `<p><a href="${codeEntryLink}">${codeEntryLink}</a></p>` +
      `<p>Or use this direct reset link:</p>` +
      `<p><a href="${link}">${link}</a></p>` +
      `<p>Reset code:</p>` +
      `<p style="font-size:24px;font-weight:700;letter-spacing:0.2em;">${code}</p>` +
      `<p>If you did not request this, ignore this email. This link expires in 24 hours.</p>` +
      `<p>-Cornerstone</p>`
  });
}

module.exports = { getProviderName, sendVerificationEmail, sendPasswordResetEmail };
