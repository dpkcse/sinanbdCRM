const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// dropdown options for assignments
router.get('/options', async (req, res) => {
  const [rows] = await pool.query('SELECT id, name FROM users WHERE is_active=1 ORDER BY name');
  res.json({ data: rows });
});

module.exports = router;
