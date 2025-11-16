// routes/adminRoles.js
const express = require('express');
const router  = express.Router();
const pool    = require('../db');
const { requireAuth } = require('../middleware/auth');

// সব রুট – login required + admin check
router.use(requireAuth);

function requireAdmin(req, res, next) {
  // users.role ENUM: ADMIN, MANAGER, SALES, VIEWER
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin only' });
  }
  next();
}
router.use(requireAdmin);

/**
 * GET /api/admin/roles
 * সব role + attached permissions
 */
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        r.id,
        r.name,
        r.slug,
        r.description,
        -- permissions.code কে UI তে slug হিসেবে ব্যবহার করব
        GROUP_CONCAT(p.code ORDER BY p.code SEPARATOR ',') AS permission_slugs
      FROM roles r
      LEFT JOIN role_permissions rp ON rp.role_id = r.id
      LEFT JOIN permissions    p    ON p.id = rp.permission_id
      GROUP BY r.id, r.name, r.slug, r.description
      ORDER BY r.name ASC
      `
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/admin/roles
 * body: { name, slug, description }
 */
router.post('/', async (req, res, next) => {
  try {
    const { name, slug, description } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: 'Name & slug required' });
    }

    const [result] = await pool.query(
      'INSERT INTO roles (name, slug, description) VALUES (?,?,?)',
      [name, slug, description || null]
    );

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    next(err);
  }
});

/**
 * PUT /api/admin/roles/:id
 */
router.put('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const { name, slug, description } = req.body;

    await pool.query(
      'UPDATE roles SET name = ?, slug = ?, description = ? WHERE id = ?',
      [name, slug, description || null, id]
    );

    res.json({ ok: true });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    next(err);
  }
});

/**
 * DELETE /api/admin/roles/:id
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM roles WHERE id = ?', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/admin/roles/:id/permissions
 * body: { permission_ids: [1,2,3] }
 * পুরো সেট replace করবে
 */
router.post('/:id/permissions', async (req, res, next) => {
  try {
    const roleId = req.params.id;
    const ids    = Array.isArray(req.body.permission_ids)
      ? req.body.permission_ids.map((x) => parseInt(x, 10)).filter(Boolean)
      : [];

    await pool.query('DELETE FROM role_permissions WHERE role_id = ?', [
      roleId,
    ]);

    if (ids.length) {
      const values = ids.map((pid) => [roleId, pid]);
      await pool.query(
        'INSERT INTO role_permissions (role_id, permission_id) VALUES ?',
        [values]
      );
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
