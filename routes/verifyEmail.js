// routes/verifyEmail.js
const express = require('express');
const router  = express.Router();
const pool    = require('../db');

router.get('/verify-email/:token', async (req, res, next) => {
  try {
    const token = req.params.token;

    const [rows] = await pool.query(
      `
      SELECT * FROM email_verification_tokens
      WHERE token = ?
        AND used_at IS NULL
        AND expires_at > NOW()
      LIMIT 1
      `,
      [token]
    );

    if (!rows.length) {
      return res.status(400).send('Invalid or expired verification link.');
    }

    const row = rows[0];

    await pool.query('UPDATE users SET is_active = 1 WHERE id = ?', [
      row.user_id,
    ]);
    await pool.query(
      'UPDATE email_verification_tokens SET used_at = NOW() WHERE id = ?',
      [row.id]
    );

    // simple response – চাইলে সুন্দর EJS page render করতে পারো
    res.send('Email verified! You can now log in.');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
