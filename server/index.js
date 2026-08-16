'use strict';
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const config = require('./config');
require('./db'); // initialise schema on boot
const authRoutes = require('./routes/auth');
const mapRoutes = require('./routes/maps');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1); // correct client IPs / secure cookies behind a proxy

// Security headers (CSP allows the app's Google Fonts + data: favicon/exports)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join('; '));
  next();
});

app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

// Rate-limit the auth surface to blunt brute-force / abuse.
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false });

app.get('/api/health', (req, res) => res.json({ ok: true, env: config.env }));
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/maps', mapRoutes);

// Serve ONLY the known frontend assets (never node_modules / server / .env).
const ROOT = path.join(__dirname, '..');
app.use('/css', express.static(path.join(ROOT, 'css')));
app.use('/js', express.static(path.join(ROOT, 'js')));
app.use('/assets', express.static(path.join(ROOT, 'assets')));

// Everything else that isn't an API call returns the SPA shell.
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(ROOT, 'index.html'));
});

// JSON 404 for unknown API routes.
app.use((req, res) => res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Not found.' } }));

app.listen(config.port, () => {
  console.log(`MindMap server listening on ${config.appUrl}  (env=${config.env})`);
});
