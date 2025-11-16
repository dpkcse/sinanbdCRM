// routes/dashboard.js
const express = require('express');
const router  = express.Router();
const pool    = require('../db');
const { requireAuth } = require('../middleware/auth');

// শুধু API – view রাউট app.js এ আছে

// Dashboard summary JSON
router.get('/api/dashboard/summary', requireAuth, async (req, res, next) => {
  try {
    const [[totals]] = await pool.query(
      `SELECT
         COUNT(*) AS totalLeads,
         SUM(created_at >= CURDATE()) AS newToday,
         SUM(created_at >= CURDATE() - INTERVAL 7 DAY) AS last7Days
       FROM leads`
    );

    const [byStage] = await pool.query(
      `SELECT
          COALESCE(ps.name, 'Uncategorized') AS stage,
          COUNT(*) AS count
       FROM leads l
       LEFT JOIN prospect_stages ps ON ps.id = l.prospect_stage_id
       GROUP BY ps.id, ps.name
       ORDER BY ps.display_order ASC, ps.id ASC`
    );

    const [last14] = await pool.query(
      `SELECT DATE(created_at) AS d, COUNT(*) AS c
         FROM leads
        WHERE created_at >= CURDATE() - INTERVAL 13 DAY
        GROUP BY DATE(created_at)
        ORDER BY d ASC`
    );

    const [recent] = await pool.query(
      `SELECT id, prospect_name, primary_mobile, priority, created_at
         FROM leads
        ORDER BY created_at DESC
        LIMIT 8`
    );

    res.json({ totals, byStage, last14, recent });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
