'use strict';
/** Session helpers + route guards. Sessions are stateless JWTs in an httpOnly cookie. */
const jwt = require('jsonwebtoken');
const db = require('./db');
const config = require('./config');

const findUser = db.prepare('SELECT id, name, email, verified, role, status, created_at FROM users WHERE id = ?');

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

// Authenticated AND active. A disabled account is rejected immediately, which
// effectively invalidates its existing sessions on the next request.
function requireAuth(req, res, next) {
  const user = getUserFromReq(req);
  if (!user) return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Please log in to continue.' } });
  if (user.status === 'disabled') {
    res.clearCookie(config.cookieName, { path: '/' });
    return res.status(403).json({ error: { code: 'DISABLED', message: 'Your account has been disabled. Please contact the administrator.' } });
  }
  req.user = user;
  next();
}

function requireVerified(req, res, next) {
  if (!req.user.verified) {
    return res.status(403).json({ error: { code: 'UNVERIFIED', message: 'Verify your email to use this feature.' } });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Administrator access only.' } });
  }
  next();
}

module.exports = { getUserFromReq, requireAuth, requireVerified, requireAdmin };
