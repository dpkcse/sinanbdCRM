// middleware/auth.js

const jwt  = require('jsonwebtoken');
const pool = require('../db');

const ACCESS_SECRET  = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;

/* ---------------- Refresh cookie থেকে basic user ---------------- */

async function getUserFromRefresh(rt) {
  if (!rt) return null;

  try {
    const payload = jwt.verify(rt, REFRESH_SECRET); // { sub, jti, exp }
    const [rows] = await pool.query(
      'SELECT user_id, revoked FROM refresh_tokens WHERE jti = ? AND user_id = ? LIMIT 1',
      [payload.jti, payload.sub]
    );
    if (!rows.length || rows[0].revoked) return null;
    return { id: payload.sub };
  } catch {
    return null;
  }
}

/* ---------------- DB থেকে full user + permissions ---------------- */

async function getFullUser(userId) {
  const [rows] = await pool.query(
    'SELECT id, email, role FROM users WHERE id = ? LIMIT 1',
    [userId]
  );
  if (!rows.length) return null;

  const u = rows[0];
  return {
    id: u.id,
    email: u.email,
    role: u.role, // ENUM: ADMIN / MANAGER / SALES / VIEWER
  };
}

async function getUserPermissions(userId) {
  const [rows] = await pool.query(
    `
    SELECT DISTINCT p.code
    FROM user_roles ur
    JOIN role_permissions rp ON rp.role_id = ur.role_id
    JOIN permissions      p  ON p.id = rp.permission_id
    WHERE ur.user_id = ?
    `,
    [userId]
  );
  return rows.map((r) => r.code);
}

/* ---------------- PAGE GUARDS (EJS views) ---------------- */

async function requirePageAuth(req, res, next) {
  try {
    const basic = await getUserFromRefresh(req.cookies?.rt);
    if (!basic) return res.redirect('/login');

    const fullUser = await getFullUser(basic.id);
    if (!fullUser) return res.redirect('/login');

    const perms = await getUserPermissions(fullUser.id);

    fullUser.permissions = perms;

    req.user = fullUser;
    res.locals.currentUser = fullUser;
    res.locals.permissions = perms;

    return next();
  } catch (err) {
    console.error('requirePageAuth error:', err);
    return res.redirect('/login');
  }
}

async function redirectIfAuthed(req, res, next) {
  const basic = await getUserFromRefresh(req.cookies?.rt);
  if (basic) return res.redirect('/dashboard');
  return next();
}

async function baseRedirect(req, res) {
  const basic = await getUserFromRefresh(req.cookies?.rt);
  return res.redirect(basic ? '/dashboard' : '/login');
}

/* ---------------- API GUARD (REST API) ---------------- */

async function requireAuth(req, res, next) {
  const hdr       = req.headers.authorization || '';
  const hasBearer = hdr.startsWith('Bearer ');

  // ১) Bearer access token থাকলে আগে সেটাই ট্রাই করি
  if (hasBearer) {
    const token = hdr.slice(7);
    try {
      const payload = jwt.verify(token, ACCESS_SECRET);
      req.user = {
        id:    payload.sub,
        email: payload.email,
        role:  payload.role,
      };
      return next();
    } catch (err) {
      console.warn('requireAuth: access token invalid, trying refresh cookie');
    }
  }

  // ২) refresh cookie fallback
  try {
    const basic = await getUserFromRefresh(req.cookies?.rt);
    if (!basic) {
      return res.status(401).json({ error: 'Missing token' });
    }

    const fullUser = await getFullUser(basic.id);
    if (!fullUser) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = fullUser;
    return next();
  } catch (err) {
    console.error('requireAuth error:', err);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/* ---------------- ROLE CHECK (optional) ---------------- */

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return next();
  };
}

/* ---------------- PERMISSION HELPERS ---------------- */

async function userHasAnyPermission(user, codes) {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  if (!codes.length) return true;

  const placeholders = codes.map(() => '?').join(', ');
  const params       = [user.id, ...codes];

  const [rows] = await pool.query(
    `
    SELECT DISTINCT p.code
    FROM user_roles ur
    JOIN role_permissions rp ON rp.role_id = ur.role_id
    JOIN permissions      p  ON p.id = rp.permission_id
    WHERE ur.user_id = ?
      AND p.code IN (${placeholders})
    `,
    params
  );

  return rows.length > 0;
}

function requirePermission(...codes) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const ok = await userHasAnyPermission(req.user, codes);
      if (!ok) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      return next();
    } catch (err) {
      console.error('requirePermission error:', err);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
}

module.exports = {
  requireAuth,
  requireRoles,
  requirePermission,
  requirePageAuth,
  redirectIfAuthed,
  baseRedirect,
};
