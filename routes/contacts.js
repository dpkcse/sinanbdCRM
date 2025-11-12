const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// List (supports ?limit=)
router.get('/', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '100', 10), 500);
  const [rows] = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC LIMIT ?', [limit]);
  res.json({ data: rows });
});

// Metrics for dashboard
router.get('/metrics', async (req, res) => {
  const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM contacts');
  const [[{ today }]] = await pool.query('SELECT COUNT(*) AS today FROM contacts WHERE DATE(created_at)=CURDATE()');
  const [[{ last7 }]] = await pool.query('SELECT COUNT(*) AS last7 FROM contacts WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)');
  res.json({ total, today, last7 });
});

router.post('/', async (req, res) => {
  const { name, email, phone, company, address, notes } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Name required' });
  const [r] = await pool.query(
    'INSERT INTO contacts (name, email, phone, company, address, notes, owner_id) VALUES (?,?,?,?,?,?,?)',
    [name, email || null, phone || null, company || null, address || null, notes || null, req.user?.id || null]
  );
  const [rows] = await pool.query('SELECT * FROM contacts WHERE id=?', [r.insertId]);
  res.status(201).json({ data: rows[0] });
});

router.get('/:id', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM contacts WHERE id=?', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json({ data: rows[0] });
});

router.put('/:id', async (req, res) => {
  const { name, email, phone, company, address, notes } = req.body || {};
  await pool.query(
    'UPDATE contacts SET name=COALESCE(?,name), email=?, phone=?, company=?, address=?, notes=? WHERE id=?',
    [name, email || null, phone || null, company || null, address || null, notes || null, req.params.id]
  );
  const [rows] = await pool.query('SELECT * FROM contacts WHERE id=?', [req.params.id]);
  res.json({ data: rows[0] });
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM contacts WHERE id=?', [req.params.id]);
  res.status(204).send();
});

module.exports = router;
