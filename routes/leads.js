// routes/leads.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});
const { parse } = require('csv-parse/sync');

router.use(requireAuth);

/* ---------- List + search + pagination ---------- */
router.get('/', async (req, res) => {
  const q = (req.query.q || '').trim();
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const pageSize = Math.min(
    Math.max(parseInt(req.query.pageSize || '10', 10), 1),
    100
  );

  const where = [];
  const params = [];

  if (q) {
    where.push(`(
      prospect_name     LIKE ? OR
      primary_email     LIKE ? OR
      primary_mobile    LIKE ? OR
      alternative_mobile LIKE ? OR
      project_type      LIKE ? OR
      project_size      LIKE ? OR
      district          LIKE ? OR
      thana             LIKE ? OR
      area              LIKE ?
    )`);
    for (let i = 0; i < 9; i++) params.push(`%${q}%`);
  }

  const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM leads ${whereSql}`,
    params
  );

  const offset = (page - 1) * pageSize;

  const [rows] = await pool.query(
    `SELECT * FROM leads ${whereSql}
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );

  res.json({ data: rows, total, page, pageSize });
});

/* ---------- Create lead (Initial + Basic info) ---------- */
router.post('/', async (req, res) => {
  const b = req.body || {};

  if (!b.prospect_name || !b.primary_mobile) {
    return res
      .status(400)
      .json({ error: 'Prospect name & primary mobile required' });
  }

  // Assign user (primary) + additional assign user (comma separated ids)
  const ownerId =
    b.assign_user && String(b.assign_user).trim()
      ? b.assign_user
      : req.user?.id || null;

  const additionalOwners = Array.isArray(b.additional_assign_user)
    ? b.additional_assign_user.join(',')
    : (b.additional_assign_user || null);

  const [r] = await pool.query(
    `INSERT INTO leads (
        prospect_type,
        prospect_name,
        primary_email,
        primary_mobile,
        alternative_mobile,
        project_type,
        project_size,
        project_details,
        priority,
        district,
        thana,
        area,
        street_details,
        campaign,
        info_source,
        already_client,
        status,
        owner_id,
        additional_owner_ids
      )
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      'Individual', // prospect_type default
      b.prospect_name,
      b.primary_email || null,
      b.primary_mobile,
      b.alternative_mobile || null,
      b.project_type || null,
      b.project_size || null,
      b.project_details || null,
      b.priority || 'Normal',
      b.district || null,
      b.thana || null,
      b.area || null,
      b.street_details || null,
      b.campaign || null,
      b.info_source || null,
      b.already_client ? 1 : 0,
      'New', // status default
      ownerId,
      additionalOwners
    ]
  );

  const [rows] = await pool.query('SELECT * FROM leads WHERE id=?', [
    r.insertId
  ]);
  res.status(201).json({ data: rows[0] });
});

/* ---------- Bulk Template & Upload ---------- */
router.get('/template', async (req, res) => {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="leads_template.csv"'
  );

  // এক্সেল টেবিলের ফিল্ড অনুযায়ী হেডার
  res.send(
    [
      'prospect_name,primary_mobile,alternative_mobile,primary_email,project_type,project_size,project_details,priority,district,thana,area,street_details,campaign,info_source,assign_user,additional_assign_user,already_client'
    ].join('\n')
  );
});

router.post('/bulk', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'CSV file required' });
  }

  const csv = req.file.buffer.toString('utf8');
  let records;
  try {
    records = parse(csv, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
  } catch (e) {
    return res.status(400).json({ error: 'Invalid CSV: ' + e.message });
  }

  let inserted = 0;
  const errors = [];

  for (let i = 0; i < records.length; i++) {
    const r = records[i];

    if (!r.prospect_name || !r.primary_mobile) {
      errors.push(`Row ${i + 2}: name & mobile required`);
      continue;
    }

    try {
      const ownerId =
        r.assign_user && String(r.assign_user).trim()
          ? r.assign_user
          : req.user?.id || null;

      const additionalOwners =
        r.additional_assign_user && String(r.additional_assign_user).trim()
          ? r.additional_assign_user
          : null;

      await pool.query(
        `INSERT INTO leads (
            prospect_type,
            prospect_name,
            primary_email,
            primary_mobile,
            alternative_mobile,
            project_type,
            project_size,
            project_details,
            priority,
            district,
            thana,
            area,
            street_details,
            campaign,
            info_source,
            already_client,
            status,
            owner_id,
            additional_owner_ids
          )
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          'Individual',
          r.prospect_name,
          r.primary_email || null,
          r.primary_mobile,
          r.alternative_mobile || null,
          r.project_type || null,
          r.project_size || null,
          r.project_details || null,
          r.priority || 'Normal',
          r.district || null,
          r.thana || null,
          r.area || null,
          r.street_details || null,
          r.campaign || null,
          r.info_source || null,
          r.already_client &&
          String(r.already_client).toLowerCase() === 'true'
            ? 1
            : 0,
          'New',
          ownerId,
          additionalOwners
        ]
      );
      inserted++;
    } catch (e) {
      errors.push(`Row ${i + 2}: ${e.code || e.message}`);
    }
  }

  res.json({ inserted, errors });
});

/* ---------- Delete lead ---------- */
router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM leads WHERE id=?', [req.params.id]);
  res.status(204).send();
});

/* ---------- Simple metrics ---------- */
router.get('/metrics', async (req, res) => {
  const [[{ total }]] = await pool.query(
    'SELECT COUNT(*) AS total FROM leads'
  );
  const [[{ today }]] = await pool.query(
    'SELECT COUNT(*) AS today FROM leads WHERE DATE(created_at)=CURDATE()'
  );
  const [[{ last7 }]] = await pool.query(
    'SELECT COUNT(*) AS last7 FROM leads WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)'
  );
  res.json({ total, today, last7 });
});

/* ---------- Stats ---------- */
router.get('/stats', async (req, res) => {
  const [byStatus] = await pool.query(
    'SELECT status AS k, COUNT(*) AS v FROM leads GROUP BY status ORDER BY v DESC'
  );
  const [byPriority] = await pool.query(
    'SELECT priority AS k, COUNT(*) AS v FROM leads GROUP BY priority ORDER BY FIELD(priority,"High","Normal","Low"), v DESC'
  );
  const [bySource] = await pool.query(
    'SELECT COALESCE(info_source,"(Unknown)") AS k, COUNT(*) AS v FROM leads GROUP BY info_source ORDER BY v DESC LIMIT 8'
  );
  const [trend14] = await pool.query(
    `SELECT DATE(created_at) AS d, COUNT(*) AS v
     FROM leads
     WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
     GROUP BY DATE(created_at)
     ORDER BY d ASC`
  );
  const [recent] = await pool.query(
    `SELECT id, prospect_name, primary_mobile, status, created_at
     FROM leads
     ORDER BY created_at DESC
     LIMIT 10`
  );
  res.json({ byStatus, byPriority, bySource, trend14, recent });
});

module.exports = router;
