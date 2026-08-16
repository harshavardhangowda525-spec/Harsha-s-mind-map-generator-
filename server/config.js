'use strict';
/**
 * Central configuration, sourced entirely from environment variables so that
 * no secret is ever hard-coded. Copy .env.example to .env for local dev.
 */
require('dotenv').config();
const path = require('path');

const bool = (v, d) => (v == null || v === '') ? d : /^(1|true|yes|on)$/i.test(String(v));
const int = (v, d) => (v == null || v === '') ? d : parseInt(v, 10);

const port = int(process.env.PORT, 3000);

const config = {
  env: process.env.NODE_ENV || 'development',
  port,

  // Public base URL used to build links inside verification / reset emails.
  // Falls back to Render's auto-provided URL so links work without extra config.
  appUrl: (process.env.APP_URL || process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`).replace(/\/+$/, ''),

  // Authentication provider (self-hosted JWT sessions in httpOnly cookies).
  jwtSecret: process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieName: process.env.SESSION_COOKIE_NAME || 'mm_session',
  cookieMaxAgeMs: int(process.env.SESSION_MAX_AGE_DAYS, 7) * 24 * 3600 * 1000,
  bcryptRounds: int(process.env.BCRYPT_ROUNDS, 12),

  // Database
  db: {
    file: process.env.DATABASE_FILE || path.join(__dirname, '..', 'data', 'mindmap.db')
  },

  // Email service (SMTP). If host is empty, emails are logged to the console
  // (dev mode) and the link is returned in the API response for testing.
  mail: {
    host: process.env.SMTP_HOST || '',
    port: int(process.env.SMTP_PORT, 587),
    secure: bool(process.env.SMTP_SECURE, false),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'MindMap <no-reply@mindmap.local>'
  },

  // Token lifetimes
  verifyTokenTtlMs: int(process.env.EMAIL_VERIFICATION_EXPIRES_MIN, 1440) * 60 * 1000, // 24h
  resetTokenTtlMs: int(process.env.PASSWORD_RESET_EXPIRES_MIN, 60) * 60 * 1000,        // 1h

  isProd() { return this.env === 'production'; }
};

if (config.isProd()) {
  if (config.jwtSecret === 'dev-only-insecure-secret-change-me') {
    console.warn('[SECURITY] JWT_SECRET is not set — set a strong secret in production.');
  }
  if (!config.mail.host) {
    console.warn('[MAIL] No SMTP_HOST set — verification emails will only be logged, not sent.');
  }
}

module.exports = config;
