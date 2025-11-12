// middleware/pageAuth.js
const jwt = require('jsonwebtoken');
const pool = require('../db');

// ✅ env names统一 করুন — এগুলো .env এ থাকতে হবে
const ACCESS_SECRET  = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;

// Refresh cookie থেকে ইউজার বের করুন (login check এর জন্য যথেষ্ট)
async function getUserFromRefresh(rt) {
  if (!rt) return null;
  try {
    const payload = jwt.verify(rt, REFRESH_SECRET); // { sub, jti, exp, ... }
    const [rows] = await pool.query(
      'SELECT user_id, revoked FROM refresh_tokens WHERE jti=? AND user_id=? LIMIT 1',
      [payload.jti, payload.sub]
    );
    if (!rows.length || rows[0].revoked) return null;
    return { id: payload.sub };
  } catch {
    return null;
  }
}

/* ---------- Page guards ---------- */
async function requirePageAuth(req, res, next) {
  const u = await getUserFromRefresh(req.cookies?.rt);
  if (!u) return res.redirect('/login');
  req.user = u;
  return next();
}

async function redirectIfAuthed(req, res, next) {
  const u = await getUserFromRefresh(req.cookies?.rt);
  if (u) return res.redirect('/dashboard');
  return next();
}

async function baseRedirect(req, res) {
  const u = await getUserFromRefresh(req.cookies?.rt);
  return res.redirect(u ? '/dashboard' : '/login');
}

/* ---------- API guards ---------- */
function requireAuth(req, res, next) {
  const hdr = req.headers.authorization || '';
  if (!hdr.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }
  const token = hdr.slice(7);
  try {
    const payload = jwt.verify(token, ACCESS_SECRET);
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    return next();
  };
}

module.exports = { requireAuth, requireRoles, requirePageAuth, redirectIfAuthed, baseRedirect };
