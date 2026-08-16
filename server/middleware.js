'use strict';
/** Session helpers + route guards. Sessions are stateless JWTs in an httpOnly cookie. */
const jwt = require('jsonwebtoken');
const db = require('./db');
const config = require('./config');

const findUser = db.prepare('SELECT id, name, email, verified, created_at FROM users WHERE id = ?');

function getUserFromReq(req) {
  const token = req.cookies && req.cookies[config.cookieName];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = findUser.get(payload.sub);
    return user || null;
  } catch (e) {
    return null;
  }
}

function requireAuth(req, res, next) {
  const user = getUserFromReq(req);
  if (!user) return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Please log in to continue.' } });
  req.user = user;
  next();
}

function requireVerified(req, res, next) {
  if (!req.user.verified) {
    return res.status(403).json({ error: { code: 'UNVERIFIED', message: 'Verify your email to use this feature.' } });
  }
  next();
}

module.exports = { getUserFromReq, requireAuth, requireVerified };
