'use strict';
const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const config = require('../config');
const tokens = require('../tokens');
const mailer = require('../mailer');
const { getUserFromReq } = require('../middleware');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const norm = (e) => String(e || '').trim().toLowerCase();
const fail = (res, status, code, message, extra) =>
  res.status(status).json(Object.assign({ error: { code, message } }, extra || {}));

const findByEmail = db.prepare('SELECT * FROM users WHERE email = ?');
const insertUser = db.prepare(
  'INSERT INTO users (id, name, email, password_hash, verified, created_at) VALUES (?, ?, ?, ?, 0, ?)'
);
const setVerified = db.prepare('UPDATE users SET verified = 1 WHERE id = ?');
const setPassword = db.prepare('UPDATE users SET password_hash = ? WHERE id = ?');

function publicUser(u) {
  return { id: u.id, name: u.name, email: u.email, verified: !!u.verified };
}

function setSession(res, userId) {
  const token = jwt.sign({ sub: userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  res.cookie(config.cookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.isProd(),
    maxAge: config.cookieMaxAgeMs,
    path: '/'
  });
}

async function issueVerification(user) {
  const raw = tokens.createToken(user.id, 'verify', config.verifyTokenTtlMs);
  const url = `${config.appUrl}/api/auth/verify?token=${raw}`;
  const result = await mailer.sendVerification(user.email, user.name, url);
  return { url, dev: result.dev };
}

/* ---------------- Sign up ---------------- */
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body || {};
    if (!name || !email || !password) return fail(res, 400, 'MISSING_FIELDS', 'Name, email and password are required.');
    const em = norm(email);
    if (!EMAIL_RE.test(em)) return fail(res, 400, 'INVALID_EMAIL', 'Please enter a valid email address.');
    if (String(password).length < 8) return fail(res, 400, 'WEAK_PASSWORD', 'Password must be at least 8 characters.');
    if (confirmPassword != null && password !== confirmPassword) return fail(res, 400, 'PASSWORD_MISMATCH', 'Passwords do not match.');

    if (findByEmail.get(em)) return fail(res, 409, 'EMAIL_TAKEN', 'An account with this email already exists.');

    const id = crypto.randomUUID();
    const hash = await bcrypt.hash(String(password), config.bcryptRounds);
    insertUser.run(id, String(name).trim().slice(0, 80), em, hash, Date.now());

    const { url, dev } = await issueVerification({ id, name, email: em });
    const resp = { ok: true, email: em };
    if (dev && !config.isProd()) resp.devVerifyUrl = url; // convenience for local testing only
    res.status(201).json(resp);
  } catch (e) {
    console.error('signup error', e);
    fail(res, 500, 'SERVER_ERROR', 'Something went wrong. Please try again.');
  }
});

/* ---------------- Verify email (link target) ---------------- */
router.get('/verify', (req, res) => {
  const result = tokens.consumeToken(String(req.query.token || ''), 'verify');
  const base = config.appUrl + '/';
  if (!result.ok) {
    const status = result.code === 'TOKEN_EXPIRED' ? 'expired' : 'invalid';
    return res.redirect(`${base}?verify=${status}`);
  }
  setVerified.run(result.userId);
  setSession(res, result.userId); // log them in so they land straight on the dashboard
  res.redirect(`${base}?verify=success`);
});

/* ---------------- Resend verification ---------------- */
router.post('/resend', async (req, res) => {
  try {
    const em = norm(req.body && req.body.email);
    const user = findByEmail.get(em);
    const resp = { ok: true };
    if (user && !user.verified) {
      const { url, dev } = await issueVerification(user);
      if (dev && !config.isProd()) resp.devVerifyUrl = url;
    }
    res.json(resp); // generic response — never reveals whether the email exists
  } catch (e) {
    console.error('resend error', e);
    fail(res, 500, 'SERVER_ERROR', 'Something went wrong. Please try again.');
  }
});

/* ---------------- Log in ---------------- */
router.post('/login', async (req, res) => {
  try {
    const em = norm(req.body && req.body.email);
    const password = String((req.body && req.body.password) || '');
    const user = findByEmail.get(em);
    // Constant-ish work whether or not the user exists.
    const hash = user ? user.password_hash : '$2a$12$0000000000000000000000000000000000000000000000000000';
    const ok = await bcrypt.compare(password, hash);
    if (!user || !ok) return fail(res, 401, 'INVALID_CREDENTIALS', 'Incorrect email or password.');
    if (!user.verified) return fail(res, 403, 'UNVERIFIED', 'Please verify your email before logging in.', { email: user.email });
    setSession(res, user.id);
    res.json({ ok: true, user: publicUser(user) });
  } catch (e) {
    console.error('login error', e);
    fail(res, 500, 'SERVER_ERROR', 'Something went wrong. Please try again.');
  }
});

/* ---------------- Log out ---------------- */
router.post('/logout', (req, res) => {
  res.clearCookie(config.cookieName, { path: '/' });
  res.json({ ok: true });
});

/* ---------------- Current user ---------------- */
router.get('/me', (req, res) => {
  const user = getUserFromReq(req);
  res.json({ user: user ? publicUser(user) : null });
});

/* ---------------- Forgot password ---------------- */
router.post('/forgot-password', async (req, res) => {
  try {
    const em = norm(req.body && req.body.email);
    const user = findByEmail.get(em);
    const resp = { ok: true };
    if (user) {
      const raw = tokens.createToken(user.id, 'reset', config.resetTokenTtlMs);
      const url = `${config.appUrl}/?reset=${raw}`;
      const r = await mailer.sendPasswordReset(user.email, user.name, url);
      if (r.dev && !config.isProd()) resp.devResetUrl = url;
    }
    res.json(resp); // generic — never reveals whether the email exists
  } catch (e) {
    console.error('forgot error', e);
    fail(res, 500, 'SERVER_ERROR', 'Something went wrong. Please try again.');
  }
});

/* ---------------- Reset password ---------------- */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body || {};
    if (String(password || '').length < 8) return fail(res, 400, 'WEAK_PASSWORD', 'Password must be at least 8 characters.');
    if (confirmPassword != null && password !== confirmPassword) return fail(res, 400, 'PASSWORD_MISMATCH', 'Passwords do not match.');
    const result = tokens.consumeToken(String(token || ''), 'reset');
    if (!result.ok) {
      const code = result.code === 'TOKEN_EXPIRED' ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID';
      return fail(res, 400, code, 'This reset link is invalid or has expired.');
    }
    const hash = await bcrypt.hash(String(password), config.bcryptRounds);
    setPassword.run(hash, result.userId);
    res.json({ ok: true });
  } catch (e) {
    console.error('reset error', e);
    fail(res, 500, 'SERVER_ERROR', 'Something went wrong. Please try again.');
  }
});

module.exports = router;
