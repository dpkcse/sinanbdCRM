// routes/hrEmployees.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { sendEmployeeLoginEmail } = require('../utils/mailer');
const { requireAuth, requirePermission } = require('../middleware/auth');

// সব HR API আগে auth চেক করবে (leads.js এর মতই)
router.use(requireAuth);

// ---- CV upload config ----
const cvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'cv');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.pdf';
    const ts = Date.now();
    cb(null, `cv_${ts}_${Math.floor(Math.random() * 1e6)}${ext}`);
  },
});

const cvUpload = multer({
  storage: cvStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ---- Helper: employee code generator ----
async function generateEmployeeCode() {
  const [rows] = await pool.query(
    'SELECT employee_code FROM employees ORDER BY id DESC LIMIT 1'
  );

  let nextNum = 1;
  if (rows.length && rows[0].employee_code) {
    const m = rows[0].employee_code.match(/\d+$/);
    if (m) nextNum = parseInt(m[0], 10) + 1;
  }

  return 'EMP' + String(nextNum).padStart(4, '0');
}

/**
 * GET /api/hr/employees?q=
 * লিস্ট + সার্চ
 */
router.get('/', async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();

    const where = [];
    const params = [];

    if (q) {
      // name / email / mobile / employee_code দিয়ে সার্চ
      where.push(
        '(e.full_name LIKE ? OR e.email LIKE ? OR e.mobile LIKE ? OR e.employee_code LIKE ?)'
      );
      for (let i = 0; i < 4; i += 1) {
        params.push(`%${q}%`);
      }
    }

    const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const [rows] = await pool.query(
      `
      SELECT
        e.*,
        u.email AS login_email
      FROM employees e
      LEFT JOIN users u ON u.id = e.user_id
      ${whereSql}
      ORDER BY e.created_at DESC
      `,
      params
    );

    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/hr/employees
 * Create employee
 */
router.post(
  '/',
  requirePermission('employees.manage'),
  async (req, res, next) => {
    try {
      const {
        full_name,
        email,
        mobile,
        alt_mobile,
        designation,
        department,
        join_date,
        status,
      } = req.body;

      if (!full_name || !email || !mobile) {
        return res.status(400).json({ error: 'Required fields missing' });
      }

      const employee_code = await generateEmployeeCode();

      const first_name = full_name.split(' ')[0] || full_name;
      const last_name = full_name.replace(first_name, '').trim() || null;

      const [result] = await pool.query(
        `
        INSERT INTO employees
          (employee_code, first_name, last_name, full_name,
           email, mobile, alt_mobile, designation, department, join_date, status,
           created_by)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
        `,
        [
          employee_code,
          first_name,
          last_name,
          full_name,
          email,
          mobile,
          alt_mobile || null,
          designation || null,
          department || null,
          join_date || null,
          status || 'active',
          req.user ? req.user.id : null,
        ]
      );

      res.status(201).json({ id: result.insertId, employee_code });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PUT /api/hr/employees/:id
 * Update employee
 */
router.put(
  '/:id',
  requirePermission('employees.manage'),
  async (req, res, next) => {
    try {
      const id = req.params.id;

      const {
        full_name,
        email,
        mobile,
        alt_mobile,
        designation,
        department,
        join_date,
        status,
      } = req.body;

      const first_name = full_name ? full_name.split(' ')[0] : null;
      const last_name =
        full_name && first_name
          ? full_name.replace(first_name, '').trim() || null
          : null;

      const fields = [];
      const params = [];

      function addField(column, value) {
        fields.push(`${column} = ?`);
        params.push(value);
      }

      if (full_name) {
        addField('full_name', full_name);
        addField('first_name', first_name);
        addField('last_name', last_name);
      }
      if (email) addField('email', email);
      if (mobile) addField('mobile', mobile);

      // এগুলো সবসময় পাঠানো হবে; না থাকলে null
      addField('alt_mobile', alt_mobile || null);
      addField('designation', designation || null);
      addField('department', department || null);
      addField('join_date', join_date || null);
      addField('status', status || 'active');
      addField('updated_by', req.user ? req.user.id : null);

      if (!fields.length) {
        return res.json({ ok: true });
      }

      params.push(id);

      await pool.query(
        `UPDATE employees SET ${fields.join(', ')} WHERE id = ?`,
        params
      );

      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/hr/employees/:id/upload-cv
 * সিভি আপলোড
 */
router.post(
  '/:id/upload-cv',
  requirePermission('employees.manage'),
  cvUpload.single('cv'),
  async (req, res, next) => {
    try {
      const id = req.params.id;

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const relPath = '/uploads/cv/' + req.file.filename;

      await pool.query('UPDATE employees SET cv_path = ? WHERE id = ?', [
        relPath,
        id,
      ]);

      res.json({ ok: true, cv_path: relPath });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/hr/employees/:id/create-user
 * Employee → User
 */
/* POST /api/hr/employees/:id/create-user – from employee => user */
/* POST /api/hr/employees/:id/create-user – from employee => user */
router.post(
  '/:id/create-user',
  requirePermission('employees.createUser'),
  async (req, res, next) => {
    try {
      const id = req.params.id;
      const { role_slug } = req.body;

      // 1) employee খুঁজো
      const [[emp]] = await pool.query(
        'SELECT * FROM employees WHERE id = ?',
        [id]
      );
      if (!emp) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      // 2) আগে থেকেই user আছে নাকি?
      if (emp.user_id) {
        return res
          .status(400)
          .json({ error: 'User already exists for this employee' });
      }

      // 3) একই email দিয়ে আগে user আছে নাকি?
      const [[existingUser]] = await pool.query(
        'SELECT id FROM users WHERE email = ? LIMIT 1',
        [emp.email]
      );
      if (existingUser) {
        return res
          .status(400)
          .json({ error: 'User already exists with this email' });
      }

      // 4) random password + hash
      const randomPassword = Math.random().toString(36).slice(-8);
      const bcrypt         = require('bcryptjs');
      const hash           = await bcrypt.hash(randomPassword, 10);

      // 5) নতুন user initially inactive রাখছি (is_active = 0)
      const [userResult] = await pool.query(
        `
        INSERT INTO users (email, name, password_hash, role, is_active, created_at)
        VALUES (?,?,?, ?, 0, NOW())
        `,
        [emp.email, emp.full_name, hash, 'SALES']
      );
      const newUserId = userResult.insertId;

      // employee → user_id link
      await pool.query('UPDATE employees SET user_id = ? WHERE id = ?', [
        newUserId,
        id,
      ]);

      // 6) role_slug থাকলে user_roles এ এড করো
      let roleName = 'User';
      if (role_slug) {
        const [[role]] = await pool.query(
          'SELECT id, name FROM roles WHERE slug = ? LIMIT 1',
          [role_slug]
        );
        if (role) {
          roleName = role.name || role_slug;
          await pool.query(
            'INSERT INTO user_roles (user_id, role_id) VALUES (?,?)',
            [newUserId, role.id]
          );
        }
      }

      // 7) email verification token তৈরি
      const crypto  = require('crypto');
      const token   = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 ঘণ্টা

      await pool.query(
        `
        INSERT INTO email_verification_tokens (user_id, token, expires_at)
        VALUES (?,?,?)
        `,
        [newUserId, token, expires]
      );

      // 8) verification URL + ইমেইল পাঠানো
      const baseUrl =
        process.env.APP_URL ||
        `${req.protocol}://${req.get('host') || 'localhost:3000'}`;
      const verifyUrl = `${baseUrl}/verify-email/${token}`;

      try {
        await sendEmployeeLoginEmail({
          to: emp.email,
          name: emp.full_name,
          roleName,
          tempPassword: randomPassword,
          verifyUrl,
        });
      } catch (mailErr) {
        console.error('sendEmployeeLoginEmail error:', mailErr);
        // ইমেইল ফেল করলে ও login তৈরি থাকবে – UI তে বাংলা alert আগের মতই যাবে
      }

      // 9) response
      res.status(201).json({
        ok: true,
        user_id: newUserId,
        temp_password: randomPassword,
      });
    } catch (err) {
      console.error('create-user error:', err);
      next(err);
    }
  }
);



module.exports = router;
