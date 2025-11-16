const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// dropdown options: /api/users/options
router.get('/options', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email FROM users WHERE is_active = 1 ORDER BY name, email'
    );

    const data = rows.map((u) => ({
      id: u.id,
      label: u.name || u.email
    }));

    res.json({ data });
  } catch (err) {
    console.error('GET /api/users/options error:', err);
    next(err);
  }
});

module.exports = router;
