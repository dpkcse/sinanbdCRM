// routes/profile.js
const express = require('express');
const router  = express.Router();
const path    = require('path');
const fs      = require('fs');
const multer  = require('multer');
const bcrypt  = require('bcryptjs');
const pool    = require('../db');
const { requireAuth, requirePageAuth } = require('../middleware/auth');

// --------- avatar uploads setup ----------
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `u${req.user.id}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

// ---------- common SELECT (user + employee) ----------
const PROFILE_SQL = `
  SELECT
    u.id         AS user_id,
    u.email      AS user_email,
    u.name       AS user_name,
    u.is_active  AS user_active,
    e.id         AS employee_id,
    e.employee_code AS employee_code,
    e.full_name  AS full_name,
    e.mobile,
    e.alt_mobile,
    e.designation,
    e.department,
    e.join_date,
    e.status     AS emp_status,
    e.profile_photo
  FROM users u
  LEFT JOIN employees e ON e.user_id = u.id
  WHERE u.id = ?
  LIMIT 1
`;

// ---------- GET /profile – view ----------
router.get('/profile', requirePageAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [[row]] = await pool.query(PROFILE_SQL, [userId]);

    res.render('profile', {
      title: 'My Profile',
      active: 'profile',
      profile: row || null,
      message: null,
      error: null,
    });
  } catch (err) {
    next(err);
  }
});

// ---------- POST /profile – basic info update ----------
router.post('/profile', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      full_name,
      mobile,
      alt_mobile,
      designation,
      department,
    } = req.body;

    // users.name update
    await pool.query(
      'UPDATE users SET name = ? WHERE id = ?',
      [full_name || null, userId]
    );

    // employees row থাকলে আপডেট করো
    const [[emp]] = await pool.query(
      'SELECT id FROM employees WHERE user_id = ? LIMIT 1',
      [userId]
    );

    if (emp) {
      await pool.query(
        `
        UPDATE employees
           SET full_name   = ?,
               mobile      = ?,
               alt_mobile  = ?,
               designation = ?,
               department  = ?
         WHERE id = ?
        `,
        [
          full_name || null,
          mobile || null,
          alt_mobile || null,
          designation || null,
          department || null,
          emp.id,
        ]
      );
    }

    const [[row]] = await pool.query(PROFILE_SQL, [userId]);

    res.render('profile', {
      title: 'My Profile',
      active: 'profile',
      profile: row || null,
      message: 'Profile updated successfully.',
      error: null,
    });
  } catch (err) {
    next(err);
  }
});

// ---------- POST /profile/photo – avatar upload ----------
router.post(
  '/profile/photo',
  requireAuth,
  upload.single('avatar'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).send('No file uploaded');
      }

      const userId = req.user.id;
      const relativePath = '/uploads/avatars/' + req.file.filename;

      const [[emp]] = await pool.query(
        'SELECT id, profile_photo FROM employees WHERE user_id = ? LIMIT 1',
        [userId]
      );

      if (emp) {
        if (emp.profile_photo && emp.profile_photo.startsWith('/uploads/')) {
          try {
            fs.unlinkSync(
              path.join(__dirname, '..', 'public', emp.profile_photo)
            );
          } catch (e) {
            // ignore old file delete errors
          }
        }

        await pool.query(
          'UPDATE employees SET profile_photo = ? WHERE id = ?',
          [relativePath, emp.id]
        );
      } else {
        console.warn('User has no employee row, avatar path not saved');
      }

      if (req.xhr || (req.headers.accept || '').includes('application/json')) {
        res.json({ ok: true, avatar: relativePath });
      } else {
        res.redirect('/profile');
      }
    } catch (err) {
      next(err);
    }
  }
);

// ---------- POST /profile/password – change password ----------
router.post('/profile/password', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { current_password, new_password, new_password_confirm } = req.body;

    if (!new_password || new_password.length < 6) {
      return renderWithError(req, res, 'New password must be at least 6 characters.');
    }
    if (new_password !== new_password_confirm) {
      return renderWithError(req, res, 'New passwords do not match.');
    }

    const [[user]] = await pool.query(
      'SELECT id, password_hash FROM users WHERE id = ? LIMIT 1',
      [userId]
    );
    if (!user) {
      return renderWithError(req, res, 'User not found.');
    }

    const ok = await bcrypt.compare(current_password || '', user.password_hash);
    if (!ok) {
      return renderWithError(req, res, 'Current password is incorrect.');
    }

    const newHash = await bcrypt.hash(new_password, 10);
    await pool.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [newHash, userId]
    );

    return renderWithMessage(req, res, 'Password changed successfully.');
  } catch (err) {
    next(err);
  }
});

// ---------- helpers ----------
async function renderWithError(req, res, error) {
  const userId = req.user.id;
  const [[row]] = await pool.query(PROFILE_SQL, [userId]);

  res.status(400).render('profile', {
    title: 'My Profile',
    active: 'profile',
    profile: row || null,
    message: null,
    error,
  });
}

async function renderWithMessage(req, res, message) {
  const userId = req.user.id;
  const [[row]] = await pool.query(PROFILE_SQL, [userId]);

  res.render('profile', {
    title: 'My Profile',
    active: 'profile',
    profile: row || null,
    message,
    error: null,
  });
}

module.exports = router;
