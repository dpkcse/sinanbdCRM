// routes/adminPermissions.js
const express = require('express');
const router  = express.Router();
const pool    = require('../db');
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
 * GET /api/admin/permissions
 */
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        id,
        description AS name,
        code        AS slug,
        description
      FROM permissions
      ORDER BY code ASC
      `
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/admin/permissions
 * body: { name, slug, description }
 * এখানে slug = code, name/description দুইটাই description এ সেট করতে পারো
 */
router.post('/', async (req, res, next) => {
  try {
    const { name, slug, description } = req.body;
    if (!slug) {
      return res.status(400).json({ error: 'Slug (code) required' });
    }

    const finalDesc = description || name || slug;

    const [result] = await pool.query(
      'INSERT INTO permissions (code, description) VALUES (?,?)',
      [slug, finalDesc]
    );

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Code already exists' });
    }
    next(err);
  }
});

/**
 * PUT /api/admin/permissions/:id
 */
router.put('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const { name, slug, description } = req.body;

    if (!slug) {
      return res.status(400).json({ error: 'Slug (code) required' });
    }

    const finalDesc = description || name || slug;

    await pool.query(
      'UPDATE permissions SET code = ?, description = ? WHERE id = ?',
      [slug, finalDesc, id]
    );

    res.json({ ok: true });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Code already exists' });
    }
    next(err);
  }
});

/**
 * DELETE /api/admin/permissions/:id
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM permissions WHERE id = ?', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
