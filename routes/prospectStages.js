// routes/prospectStages.js
const express = require('express');
const router  = express.Router();
const pool    = require('../db');
const { requireAuth } = require('../middleware/auth');

// সব রাউটের আগে টোকেন চেক
router.use(requireAuth);

/* ---------- Settings page (EJS view) ---------- */
/* যদি এখনো এই ফাইল থেকেই পেইজ রেন্ডার করো */
router.get('/manage', (req, res) => {
  res.render('prospect_stages', {
    title: 'Prospect Stage Settings — Interior CRM',
    active: 'prospect_stages'
  });
});

/* ---------- List ---------- */
router.get('/', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM prospect_stages ORDER BY display_order ASC, id ASC'
  );
  res.json({ data: rows });
});

/* ---------- Get single stage (EDIT modal-এর জন্য) ---------- */
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  const [rows] = await pool.query(
    'SELECT * FROM prospect_stages WHERE id=?',
    [id]
  );
  if (!rows.length) {
    return res.status(404).json({ error: 'Stage not found' });
  }
  res.json({ data: rows[0] });
});

/* ---------- Create ---------- */
router.post('/', async (req, res) => {
  const { name, color, display_order } = req.body || {};

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Stage name is required' });
  }

  const hex   = (color || '#000000').trim();
  const order = Number(display_order) || 0;

  const [r] = await pool.query(
    `INSERT INTO prospect_stages (name, color, display_order)
     VALUES (?,?,?)`,
    [name.trim(), hex, order]
  );

  const [rows] = await pool.query(
    'SELECT * FROM prospect_stages WHERE id=?',
    [r.insertId]
  );
  res.status(201).json({ data: rows[0] });
});

/* ---------- Update ---------- */
router.put('/:id', async (req, res) => {
  const { name, color, display_order, is_active } = req.body || {};
  const id = req.params.id;

  const [currentRows] = await pool.query(
    'SELECT * FROM prospect_stages WHERE id=?',
    [id]
  );
  if (!currentRows.length) {
    return res.status(404).json({ error: 'Stage not found' });
  }
  const current = currentRows[0];

  const newName  = name && name.trim() ? name.trim() : current.name;
  const newColor = color && color.trim() ? color.trim() : current.color;
  const newOrder =
    typeof display_order !== 'undefined'
      ? Number(display_order) || 0
      : current.display_order;
  const newActive =
    typeof is_active !== 'undefined'
      ? (String(is_active) === '1' ||
         String(is_active).toLowerCase() === 'true'
          ? 1
          : 0)
      : current.is_active;

  await pool.query(
    `UPDATE prospect_stages
       SET name=?, color=?, display_order=?, is_active=?
     WHERE id=?`,
    [newName, newColor, newOrder, newActive, id]
  );

  const [rows] = await pool.query(
    'SELECT * FROM prospect_stages WHERE id=?',
    [id]
  );
  res.json({ data: rows[0] });
});

/* ---------- Delete ---------- */
router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  await pool.query('DELETE FROM prospect_stages WHERE id=?', [id]);
  res.status(204).send();
});

module.exports = router;
