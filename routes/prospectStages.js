// routes/prospectStages.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

// সব রুট টোকেন-প্রটেক্টেড
router.use(requireAuth);

/* ---------- Settings page (EJS view) ---------- */
router.get('/manage', (req, res) => {
  res.render('prospect_stages', {
    title: 'Prospect Stage Settings — Interior CRM'
  });
});

/* ---------- List for settings page (JSON) ---------- */
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, color, display_order, is_active FROM prospect_stages ORDER BY display_order ASC, id ASC'
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

/* ---------- Minimal list for dropdown options ---------- */
/* /prospect-stages/options  -> { data: [ { id, name }, ... ] } */
router.get('/options', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name FROM prospect_stages ORDER BY display_order ASC, id ASC'
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

/* ---------- Create ---------- */
router.post('/', async (req, res, next) => {
  try {
    const b = req.body || {};
    if (!b.name) {
      return res.status(400).json({ error: 'Stage name is required' });
    }

    const [result] = await pool.query(
      `INSERT INTO prospect_stages (name, color, display_order, is_active)
       VALUES (?,?,?,?)`,
      [
        b.name,
        b.color || '#000000',
        b.display_order || 0,
        b.is_active ? 1 : 0
      ]
    );

    const [rows] = await pool.query(
      'SELECT id, name, color, display_order, is_active FROM prospect_stages WHERE id=?',
      [result.insertId]
    );

    res.status(201).json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
});

/* ---------- Update ---------- */
router.put('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const b = req.body || {};

    await pool.query(
      `UPDATE prospect_stages
       SET name=?, color=?, display_order=?, is_active=?
       WHERE id=?`,
      [
        b.name,
        b.color || '#000000',
        b.display_order || 0,
        b.is_active ? 1 : 0,
        id
      ]
    );

    const [rows] = await pool.query(
      'SELECT id, name, color, display_order, is_active FROM prospect_stages WHERE id=?',
      [id]
    );

    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
});

/* ---------- Delete ---------- */
router.delete('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    await pool.query('DELETE FROM prospect_stages WHERE id=?', [id]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
