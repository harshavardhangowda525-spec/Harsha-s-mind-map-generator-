'use strict';
/** Admin panel API. Every route requires an authenticated admin. */
const express = require('express');
const db = require('../db');
const config = require('../config');
const { requireAuth, requireAdmin } = require('../middleware');

const router = express.Router();
router.use(requireAuth, requireAdmin);

const publicRow = (u) => ({
  id: u.id, name: u.name, email: u.email,
  verified: !!u.verified, role: u.role, status: u.status,
  createdAt: u.created_at, updatedAt: u.updated_at
});

const findById = db.prepare('SELECT * FROM users WHERE id = ?');
const setStatus = db.prepare('UPDATE users SET status = ?, updated_at = ? WHERE id = ?');
const notFound = (res) => res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found.' } });

// Protect the administrator account from being disabled/deleted.
function isProtected(u) {
  return u.role === 'admin' || u.email === config.adminEmail;
}

/* ---- List / search users ---- */
router.get('/users', (req, res) => {
  const q = String(req.query.q || '').trim().toLowerCase();
  let rows;
  if (q) {
    rows = db.prepare(
      "SELECT * FROM users WHERE lower(name) LIKE ? OR lower(email) LIKE ? ORDER BY created_at DESC LIMIT 500"
    ).all('%' + q + '%', '%' + q + '%');
  } else {
    rows = db.prepare('SELECT * FROM users ORDER BY created_at DESC LIMIT 500').all();
  }
  res.json({ users: rows.map(publicRow) });
});

/* ---- Basic stats / activity overview ---- */
router.get('/stats', (req, res) => {
  const one = (sql) => db.prepare(sql).get().n;
  res.json({
    stats: {
      users: one('SELECT COUNT(*) n FROM users'),
      verified: one('SELECT COUNT(*) n FROM users WHERE verified = 1'),
      disabled: one("SELECT COUNT(*) n FROM users WHERE status = 'disabled'"),
      maps: one('SELECT COUNT(*) n FROM maps')
    }
  });
});

/* ---- User detail (+ maps count) ---- */
router.get('/users/:id', (req, res) => {
  const u = findById.get(req.params.id);
  if (!u) return notFound(res);
  const mapCount = db.prepare('SELECT COUNT(*) n FROM maps WHERE user_id = ?').get(u.id).n;
  res.json({ user: Object.assign(publicRow(u), { mapCount }) });
});

/* ---- A user's saved mind maps ---- */
router.get('/users/:id/maps', (req, res) => {
  const u = findById.get(req.params.id);
  if (!u) return notFound(res);
  const maps = db.prepare('SELECT id, title, created_at, updated_at FROM maps WHERE user_id = ? ORDER BY updated_at DESC').all(u.id);
  res.json({ maps });
});

/* ---- Enable / disable ---- */
router.post('/users/:id/disable', (req, res) => {
  const u = findById.get(req.params.id);
  if (!u) return notFound(res);
  if (isProtected(u)) return res.status(403).json({ error: { code: 'PROTECTED', message: 'The administrator account cannot be disabled.' } });
  setStatus.run('disabled', Date.now(), u.id);
  res.json({ ok: true, user: publicRow(findById.get(u.id)) });
});

router.post('/users/:id/enable', (req, res) => {
  const u = findById.get(req.params.id);
  if (!u) return notFound(res);
  setStatus.run('active', Date.now(), u.id);
  res.json({ ok: true, user: publicRow(findById.get(u.id)) });
});

/* ---- Delete account ---- */
router.delete('/users/:id', (req, res) => {
  const u = findById.get(req.params.id);
  if (!u) return notFound(res);
  if (isProtected(u)) return res.status(403).json({ error: { code: 'PROTECTED', message: 'The administrator account cannot be deleted.' } });
  db.prepare('DELETE FROM users WHERE id = ?').run(u.id); // maps cascade via FK
  res.json({ ok: true });
});

module.exports = router;
