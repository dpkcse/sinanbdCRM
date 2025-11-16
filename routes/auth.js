// routes/auth.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// keep env names consistent
const ACCESS_SECRET  = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TTL     = process.env.ACCESS_TOKEN_TTL  || '15m';
const REFRESH_TTL    = process.env.REFRESH_TOKEN_TTL || '7d';

// common cookie options (no domain for localhost)
function rtCookieOptions() {
  const opts = {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax',
    path: '/',                                // <-- base path so '/' থেকেও দেখা যায়
    maxAge: 7 * 24 * 60 * 60 * 1000           // <-- 7 days (milliseconds)
  };
  if (process.env.COOKIE_DOMAIN && process.env.COOKIE_DOMAIN !== 'localhost') {
    opts.domain = process.env.COOKIE_DOMAIN;
  }
  return opts;
}

function signAccess(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    ACCESS_SECRET,
    { expiresIn: ACCESS_TTL }
  );
}

async function issueRefresh(userId) {
  const jti = uuidv4();
  const token = jwt.sign({ sub: userId, jti }, REFRESH_SECRET, { expiresIn: REFRESH_TTL });
  const hash = await bcrypt.hash(token, 10);
  await pool.query(
    'INSERT INTO refresh_tokens (jti, token_hash, user_id, expires_at, revoked) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY), 0)',
    [jti, hash, userId]
  );
  return token;
}

async function revokeByJti(jti) {
  await pool.query('UPDATE refresh_tokens SET revoked=1 WHERE jti=?', [jti]);
}

/* ------------------- LOGIN ------------------- */
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email & password required' });

  const [rows] = await pool.query('SELECT * FROM users WHERE email=? AND is_active=1 LIMIT 1', [email]);
  const user = rows[0];
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  // 🔴 নতুন অংশ: account inactive / email verify না হলে লগইন বন্ধ
  if (!user.is_active) {
    return res
      .status(403)
      .json({ error: 'Account is not active (email not verified).' });
  }

  const accessToken  = signAccess(user);
  const refreshToken = await issueRefresh(user.id);

  // set refresh cookie (available on '/')
  res.cookie('rt', refreshToken, rtCookieOptions());

  res.json({ accessToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

/* ------------------- REFRESH ------------------- */
router.post('/refresh', async (req, res) => {
  const rt = req.cookies?.rt;
  if (!rt) return res.status(401).json({ error: 'No refresh token' });

  try {
    const decoded = jwt.verify(rt, REFRESH_SECRET);      // { sub, jti, ... }
    const [rows] = await pool.query(
      'SELECT token_hash, revoked FROM refresh_tokens WHERE jti=? LIMIT 1',
      [decoded.jti]
    );
    const rec = rows[0];
    if (!rec || rec.revoked) return res.status(401).json({ error: 'Refresh invalid' });

    const ok = await bcrypt.compare(rt, rec.token_hash);
    if (!ok) return res.status(401).json({ error: 'Refresh invalid' });

    // rotate old refresh
    await revokeByJti(decoded.jti);
    const newRt = await issueRefresh(decoded.sub);

    const [[user]] = await pool.query('SELECT id, name, email, role FROM users WHERE id=?', [decoded.sub]);
    const accessToken = signAccess(user);

    res.cookie('rt', newRt, rtCookieOptions());
    res.json({ accessToken });
  } catch (e) {
    res.status(401).json({ error: 'Refresh failed' });
  }
});

/* ------------------- LOGOUT ------------------- */
router.post('/logout', async (req, res) => {
  try {
    const rt = req.cookies?.rt;
    if (rt) {
      try {
        const p = jwt.verify(rt, REFRESH_SECRET);
        // revoke all for this user (simple + safe)
        await pool.query('UPDATE refresh_tokens SET revoked=1 WHERE user_id=?', [p.sub]);
      } catch (e) {}
    }
  } finally {
    // clear both possible paths
    res.clearCookie('rt', { path: '/', sameSite: 'lax' });
    res.clearCookie('rt', { path: '/api/auth/refresh', sameSite: 'lax' });
    return res.status(204).send();
  }
});

module.exports = router;
