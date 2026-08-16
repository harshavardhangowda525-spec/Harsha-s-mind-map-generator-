'use strict';
const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const config = require('../config');
const tokens = require('../tokens');
const mailer = require('../mailer');
const { getUserFromReq, requireAuth } = require('../middleware');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DUMMY_HASH = '$2a$12$0000000000000000000000000000000000000000000000000000';
const norm = (e) => String(e || '').trim().toLowerCase();
const fail = (res, status, code, message, extra) =>
  res.status(status).json(Object.assign({ error: { code, message } }, extra || {}));

function passwordProblem(pw) {
  pw = String(pw || '');
  if (pw.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return 'Password must include at least one letter and one number.';
  return null;
}

const findByEmail = db.prepare('SELECT * FROM users WHERE email = ?');
const findById = db.prepare('SELECT * FROM users WHERE id = ?');
const insertUser = db.prepare(
  'INSERT INTO users (id, name, email, password_hash, verified, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?)'
);
const setVerified = db.prepare('UPDATE users SET verified = 1, updated_at = ? WHERE id = ?');
const setPassword = db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?');

function publicUser(u) {
  return {
    id: u.id, name: u.name, email: u.email,
    verified: !!u.verified, role: u.role || 'user', status: u.status || 'active',
    createdAt: u.created_at
  };
}

function setSession(res, userId) {
  const token = jwt.sign({ sub: userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  res.cookie(config.cookieName, token, {
    httpOnly: true, sameSite: 'lax', secure: config.isProd(),
    maxAge: config.cookieMaxAgeMs, path: '/'
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
    const pwProblem = passwordProblem(password);
    if (pwProblem) return fail(res, 400, 'WEAK_PASSWORD', pwProblem);
    if (confirmPassword != null && password !== confirmPassword) return fail(res, 400, 'PASSWORD_MISMATCH', 'Passwords do not match.');
    if (findByEmail.get(em)) return fail(res, 409, 'EMAIL_TAKEN', 'An account with this email already exists.');

    const id = crypto.randomUUID();
    const now = Date.now();
    const hash = await bcrypt.hash(String(password), config.bcryptRounds);
    const role = em === config.adminEmail ? 'admin' : 'user';   // admin assigned server-side only
    insertUser.run(id, String(name).trim().slice(0, 80), em, hash, role, 'active', now, now);

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
  const user = findById.get(result.userId);
  setVerified.run(Date.now(), result.userId);
  if (user && user.status !== 'disabled') setSession(res, result.userId); // log them in
  res.redirect(`${base}?verify=success`);
});

/* ---------------- Resend verification ---------------- */
router.post('/resend', async (req, res) => {
  try {
    const user = findByEmail.get(norm(req.body && req.body.email));
    const resp = { ok: true };
    if (user && !user.verified) {
      const { url, dev } = await issueVerification(user);
      if (dev && !config.isProd()) resp.devVerifyUrl = url;
    }
    res.json(resp); // generic — never reveals whether the email exists
  } catch (e) {
    console.error('resend error', e);
    fail(res, 500, 'SERVER_ERROR', 'Something went wrong. Please try again.');
  }
});

/* ---------------- Change email (before verifying) ---------------- */
router.post('/change-email', async (req, res) => {
  try {
    const em = norm(req.body && req.body.email);
    const newEm = norm(req.body && req.body.newEmail);
    const password = String((req.body && req.body.password) || '');
    if (!EMAIL_RE.test(newEm)) return fail(res, 400, 'INVALID_EMAIL', 'Please enter a valid new email address.');
    const user = findByEmail.get(em);
    const ok = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
    if (!user || !ok) return fail(res, 401, 'INVALID_CREDENTIALS', 'Incorrect email or password.');
    if (user.status === 'disabled') return fail(res, 403, 'DISABLED', 'Your account has been disabled. Please contact the administrator.');
    if (newEm !== em && findByEmail.get(newEm)) return fail(res, 409, 'EMAIL_TAKEN', 'That email is already in use.');
    db.prepare('UPDATE users SET email = ?, verified = 0, updated_at = ? WHERE id = ?').run(newEm, Date.now(), user.id);
    const { url, dev } = await issueVerification({ id: user.id, name: user.name, email: newEm });
    const resp = { ok: true, email: newEm };
    if (dev && !config.isProd()) resp.devVerifyUrl = url;
    res.json(resp);
  } catch (e) {
    console.error('change-email error', e);
    fail(res, 500, 'SERVER_ERROR', 'Something went wrong. Please try again.');
  }
});

/* ---------------- Log in ---------------- */
router.post('/login', async (req, res) => {
  try {
    const em = norm(req.body && req.body.email);
    const password = String((req.body && req.body.password) || '');
    const user = findByEmail.get(em);
    const ok = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
    if (!user || !ok) return fail(res, 401, 'INVALID_CREDENTIALS', 'Incorrect email or password.');
    if (user.status === 'disabled') return fail(res, 403, 'DISABLED', 'Your account has been disabled. Please contact the administrator.');
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

/* ---------------- Current user (session restore) ---------------- */
router.get('/me', (req, res) => {
  const user = getUserFromReq(req);
  if (user && user.status === 'disabled') {
    res.clearCookie(config.cookieName, { path: '/' });
    return res.json({ user: null, disabled: true });
  }
  res.json({ user: user ? publicUser(user) : null });
});

/* ---------------- Update profile (name only) ---------------- */
router.put('/profile', requireAuth, (req, res) => {
  const name = String((req.body && req.body.name) || '').trim().slice(0, 80);
  if (!name) return fail(res, 400, 'MISSING_FIELDS', 'Name is required.');
  db.prepare('UPDATE users SET name = ?, updated_at = ? WHERE id = ?').run(name, Date.now(), req.user.id);
  res.json({ ok: true, user: publicUser(findById.get(req.user.id)) });
});

/* ---------------- Change password (while logged in) ---------------- */
router.post('/profile/password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body || {};
    const problem = passwordProblem(newPassword);
    if (problem) return fail(res, 400, 'WEAK_PASSWORD', problem);
    if (confirmPassword != null && newPassword !== confirmPassword) return fail(res, 400, 'PASSWORD_MISMATCH', 'Passwords do not match.');
    const full = findById.get(req.user.id);
    const ok = await bcrypt.compare(String(currentPassword || ''), full.password_hash);
    if (!ok) return fail(res, 400, 'INVALID_CREDENTIALS', 'Your current password is incorrect.');
    setPassword.run(await bcrypt.hash(String(newPassword), config.bcryptRounds), Date.now(), req.user.id);
    res.json({ ok: true });
  } catch (e) {
    console.error('change-password error', e);
    fail(res, 500, 'SERVER_ERROR', 'Something went wrong. Please try again.');
  }
});

/* ---------------- Forgot password ---------------- */
router.post('/forgot-password', async (req, res) => {
  try {
    const user = findByEmail.get(norm(req.body && req.body.email));
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
    const problem = passwordProblem(password);
    if (problem) return fail(res, 400, 'WEAK_PASSWORD', problem);
    if (confirmPassword != null && password !== confirmPassword) return fail(res, 400, 'PASSWORD_MISMATCH', 'Passwords do not match.');
    const result = tokens.consumeToken(String(token || ''), 'reset');
    if (!result.ok) {
      const code = result.code === 'TOKEN_EXPIRED' ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID';
      return fail(res, 400, code, 'This reset link is invalid or has expired.');
    }
    setPassword.run(await bcrypt.hash(String(password), config.bcryptRounds), Date.now(), result.userId);
    res.json({ ok: true });
  } catch (e) {
    console.error('reset error', e);
    fail(res, 500, 'SERVER_ERROR', 'Something went wrong. Please try again.');
  }
});

module.exports = router;
