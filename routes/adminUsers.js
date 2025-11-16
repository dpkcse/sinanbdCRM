// routes/adminUsers.js
const express = require('express');
const router  = express.Router();
const pool    = require('../db');

const bcrypt  = require('bcryptjs'); 
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin only' });
  }
  next();
}
router.use(requireAdmin);

/**
 * GET /api/admin/users?q=
 * সব ইউজার + তাদের roles
 */
router.get('/', async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();

    const where  = [];
    const params = [];

    if (q) {
      where.push('(u.name LIKE ? OR u.email LIKE ?)');
      params.push(`%${q}%`, `%${q}%`);
    }

    const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const [rows] = await pool.query(
      `
      SELECT
        u.id,
        u.name,
        u.email,
        u.is_active,
        u.role AS legacy_role,
        u.created_at,
        GROUP_CONCAT(r.name ORDER BY r.name SEPARATOR ', ') AS role_names,
        GROUP_CONCAT(r.id   ORDER BY r.name SEPARATOR ',') AS role_ids
      FROM users u
      LEFT JOIN user_roles ur ON ur.user_id = u.id
      LEFT JOIN roles      r  ON r.id = ur.role_id
      ${whereSql}
      GROUP BY
        u.id, u.name, u.email, u.is_active, u.role, u.created_at
      ORDER BY u.created_at DESC
      `,
      params
    );

    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/admin/users/:id
 * basic update (name / is_active)
 */
router.put('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const { name, is_active } = req.body;

    await pool.query(
      'UPDATE users SET name = ?, is_active = ? WHERE id = ?',
      [name, is_active ? 1 : 0, id]
    );

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/admin/users/:id/roles
 * body: { role_ids: [1,2,3] }
 */
router.post('/:id/roles', async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const userId = req.params.id;
    const ids = Array.isArray(req.body.role_ids)
      ? req.body.role_ids.map((x) => parseInt(x, 10)).filter(Boolean)
      : [];

    await conn.beginTransaction();

    await conn.query('DELETE FROM user_roles WHERE user_id = ?', [userId]);

    if (ids.length) {
      const values = ids.map((rid) => [userId, rid]);
      await conn.query(
        'INSERT INTO user_roles (user_id, role_id) VALUES ?',
        [values]
      );
    }

    await conn.commit();
    res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

// Admin → reset অন্য ইউজারের password
router.post('/:id/reset-password', async (req, res, next) => {
    try {
      const userId = req.params.id;
  
      // random 10-character password
      const newPassword = Math.random().toString(36).slice(-10);
      const hash        = await bcrypt.hash(newPassword, 10);
  
      await pool.query(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [hash, userId]
      );
  
      res.json({ ok: true, temp_password: newPassword });
    } catch (err) {
      next(err);
    }
  });
  

module.exports = router;
