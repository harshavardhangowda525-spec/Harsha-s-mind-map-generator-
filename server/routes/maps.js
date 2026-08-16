'use strict';
/** Per-user saved mind maps. Every route requires a verified, authenticated user. */
const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const { requireAuth, requireVerified } = require('../middleware');

const router = express.Router();
router.use(requireAuth, requireVerified);

const listStmt = db.prepare('SELECT id, title, created_at, updated_at FROM maps WHERE user_id = ? ORDER BY updated_at DESC');
const getStmt = db.prepare('SELECT * FROM maps WHERE id = ? AND user_id = ?');
const insertStmt = db.prepare('INSERT INTO maps (id, user_id, title, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)');
const updateStmt = db.prepare('UPDATE maps SET title = ?, data = ?, updated_at = ? WHERE id = ? AND user_id = ?');
const deleteStmt = db.prepare('DELETE FROM maps WHERE id = ? AND user_id = ?');

const badData = (res) => res.status(400).json({ error: { code: 'INVALID_MAP', message: 'A title and map data are required.' } });
const notFound = (res) => res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Map not found.' } });

router.get('/', (req, res) => {
  res.json({ maps: listStmt.all(req.user.id) });
});

router.get('/:id', (req, res) => {
  const row = getStmt.get(req.params.id, req.user.id);
  if (!row) return notFound(res);
  res.json({ map: { id: row.id, title: row.title, data: JSON.parse(row.data), updated_at: row.updated_at } });
});

router.post('/', (req, res) => {
  const { title, data } = req.body || {};
  if (!data || typeof data !== 'object') return badData(res);
  const id = crypto.randomUUID();
  const now = Date.now();
  insertStmt.run(id, req.user.id, String(title || 'Untitled map').slice(0, 120), JSON.stringify(data), now, now);
  res.status(201).json({ map: { id, title: title || 'Untitled map', updated_at: now } });
});

router.put('/:id', (req, res) => {
  const existing = getStmt.get(req.params.id, req.user.id);
  if (!existing) return notFound(res);
  const { title, data } = req.body || {};
  if (!data || typeof data !== 'object') return badData(res);
  const now = Date.now();
  updateStmt.run(String(title || existing.title).slice(0, 120), JSON.stringify(data), now, req.params.id, req.user.id);
  res.json({ map: { id: req.params.id, title: title || existing.title, updated_at: now } });
});

router.delete('/:id', (req, res) => {
  const info = deleteStmt.run(req.params.id, req.user.id);
  if (info.changes === 0) return notFound(res);
  res.json({ ok: true });
});

module.exports = router;
