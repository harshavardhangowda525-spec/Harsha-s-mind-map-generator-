'use strict';
/**
 * Secure, single-use, expiring tokens for email verification and password
 * reset. Only a SHA-256 hash of each token is stored, so a database leak
 * never exposes usable links. The raw token travels only in the email link.
 */
const crypto = require('crypto');
const db = require('./db');

const sha256 = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');

const insert = db.prepare(
  'INSERT INTO tokens (id, user_id, token_hash, type, expires_at, used, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)'
);
const findByHash = db.prepare('SELECT * FROM tokens WHERE token_hash = ? AND type = ?');
const markUsed = db.prepare('UPDATE tokens SET used = 1 WHERE id = ?');
// Invalidate older outstanding tokens of the same type for a user.
const invalidate = db.prepare('UPDATE tokens SET used = 1 WHERE user_id = ? AND type = ? AND used = 0');

function createToken(userId, type, ttlMs) {
  invalidate.run(userId, type);
  const raw = crypto.randomBytes(32).toString('hex');
  insert.run(crypto.randomUUID(), userId, sha256(raw), type, Date.now() + ttlMs, Date.now());
  return raw;
}

/** Validate + consume (single use). Returns { ok, userId } or { ok:false, code }. */
function consumeToken(raw, type) {
  if (!raw) return { ok: false, code: 'TOKEN_INVALID' };
  const row = findByHash.get(sha256(raw), type);
  if (!row) return { ok: false, code: 'TOKEN_INVALID' };
  if (row.used) return { ok: false, code: 'TOKEN_USED' };
  if (row.expires_at < Date.now()) return { ok: false, code: 'TOKEN_EXPIRED' };
  markUsed.run(row.id);
  return { ok: true, userId: row.user_id };
}

module.exports = { createToken, consumeToken };
