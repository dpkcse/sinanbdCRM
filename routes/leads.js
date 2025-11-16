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

// routes/leads.js  -> list route
// উদাহরণ: GET /api/leads
// GET /api/leads
router.get('/', async (req, res, next) => {
  try {
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
        l.prospect_name  LIKE ? OR
        l.primary_email  LIKE ? OR
        l.primary_mobile LIKE ? OR
        l.project_type   LIKE ?
      )`);

      for (let i = 0; i < 4; i += 1) {
        params.push(`%${q}%`);
      }
    }

    const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';

    // মোট রেকর্ড
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM leads l ${whereSql}`,
      params
    );

    const offset = (page - 1) * pageSize;

    // মূল লিস্ট
    // মূল লিস্ট
const [rows] = await pool.query(
  `
  SELECT
    l.*,

    -- Stage name
    ps.name AS stage_name,

    -- Owner
    u_owner.name AS owner_name,

    -- ⭐ সর্বশেষ follow-up
    last_fu.activity_at    AS last_followup_at,
    last_fu.activity_type  AS last_followup_type,

    -- ⭐ পরের follow-up (future এর মধ্যে closest)
    next_fu.next_followup_at AS next_followup_at,
    next_fu.activity_type    AS next_followup_type,

    -- Additional assignees (non-primary)
    (
      SELECT GROUP_CONCAT(u2.name SEPARATOR ', ')
      FROM lead_assignments la
      JOIN users u2 ON u2.id = la.user_id
      WHERE la.lead_id = l.id
        AND la.is_primary = 0
    ) AS additional_assignees

  FROM leads l
  LEFT JOIN prospect_stages ps
         ON ps.id = l.prospect_stage_id
  LEFT JOIN users AS u_owner
         ON u_owner.id = l.owner_id

  -- last follow-up (activity_at এর max)
  LEFT JOIN (
    SELECT f1.*
    FROM lead_followups f1
    JOIN (
      SELECT lead_id, MAX(activity_at) AS max_at
      FROM lead_followups
      GROUP BY lead_id
    ) t ON t.lead_id = f1.lead_id AND t.max_at = f1.activity_at
  ) AS last_fu ON last_fu.lead_id = l.id

  -- next follow-up (future এর মধ্যে সর্বনিম্ন next_followup_at + তার type)
  LEFT JOIN (
    SELECT f2.*
    FROM lead_followups f2
    JOIN (
      SELECT lead_id, MIN(next_followup_at) AS min_next
      FROM lead_followups
      WHERE next_followup_at IS NOT NULL
        AND next_followup_at >= NOW()
      GROUP BY lead_id
    ) t2 ON t2.lead_id = f2.lead_id AND t2.min_next = f2.next_followup_at
  ) AS next_fu ON next_fu.lead_id = l.id

  ${whereSql}
  ORDER BY l.created_at DESC
  LIMIT ? OFFSET ?
  `,
  [...params, pageSize, offset]
);


    res.json({ data: rows, total, page, pageSize });
  } catch (err) {
    next(err);
  }
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
  // প্রতি স্টেজে কত prospect আছে
  const [byStatus] = await pool.query(`
    SELECT 
      ps.id,
      ps.name         AS k,
      ps.color        AS color,
      ps.display_order,
      COUNT(l.id)     AS v
    FROM prospect_stages ps
    LEFT JOIN leads l ON l.prospect_stage_id = ps.id
    GROUP BY ps.id, ps.name, ps.color, ps.display_order
    ORDER BY ps.display_order ASC, ps.id ASC
  `);

  res.json({ byStatus });
});
// একটি লিড ডিটেইল + assignments
router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;

    const [rows] = await pool.query('SELECT * FROM leads WHERE id = ?', [id]);
    if (!rows.length) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    const lead = rows[0];

    const [assignRows] = await pool.query(
      'SELECT user_id, is_primary FROM lead_assignments WHERE lead_id = ?',
      [id]
    );

    res.json({ data: lead, assignments: assignRows });
  } catch (err) {
    next(err);
  }
});
// লিড আপডেট
router.put('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const b  = req.body || {};

    await pool.query(
      `UPDATE leads SET
        prospect_type      = ?,
        prospect_name      = ?,
        primary_mobile     = ?,
        alternative_mobile = ?,
        primary_email      = ?,
        project_type       = ?,
        project_size       = ?,
        project_details    = ?,
        prospect_stage_id  = ?,
        priority           = ?,
        district           = ?,
        thana              = ?,
        area               = ?,
        street_details     = ?,
        campaign           = ?,
        info_source        = ?
       WHERE id = ?`,
      [
        b.prospect_type || 'Individual',
        b.prospect_name,
        b.primary_mobile,
        b.alternative_mobile || null,
        b.primary_email || null,
        b.project_type || null,
        b.project_size || null,
        b.project_details || null,
        b.prospect_stage_id || null,
        b.priority || 'Normal',
        b.district || null,
        b.thana || null,
        b.area || null,
        b.street_details || null,
        b.campaign || null,
        b.info_source || null,
        id,
      ]
    );

    const [[lead]] = await pool.query('SELECT * FROM leads WHERE id = ?', [id]);
    res.json({ data: lead });
  } catch (err) {
    next(err);
  }
});


/* ---------- Create lead (Initial + Basic info) ---------- */
router.post('/', async (req, res) => {
  const b = req.body || {};

  if (!b.prospect_name || !b.primary_mobile) {
    return res.status(400).json({ error: 'Prospect name এবং primary mobile দরকার' });
  }

  // যদি stage না পাঠানো হয়, ডিফল্ট হিসেবে "New prospect" নাও
  let stageId = b.prospect_stage_id || null;
  if (!stageId) {
    const [s] = await pool.query(
      'SELECT id FROM prospect_stages WHERE name = ? LIMIT 1',
      ['New prospect']
    );
    if (s.length) stageId = s[0].id;
  }

  const [r] = await pool.query(
    `
    INSERT INTO leads (
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
      status,
      prospect_stage_id,
      owner_id
    )
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `,
    [
      b.prospect_type || 'Individual',
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
      b.status || 'New',        // status আলাদা চাইলে রাখো
      stageId,
      req.user?.id || null,
    ]
  );

  const [rows] = await pool.query(
    `
    SELECT l.*, ps.name AS stage_name, ps.color AS stage_color
    FROM leads l
    LEFT JOIN prospect_stages ps ON l.prospect_stage_id = ps.id
    WHERE l.id = ?
    `,
    [r.insertId]
  );

  res.status(201).json({ data: rows[0] });
});

// Follow up
router.post('/:id/followups', requireAuth, async (req, res, next) => {
  try {
    const leadId = req.params.id;
    const { activity_type, activity_note, activity_at, next_followup_at } = req.body;

    const at =
      activity_at && activity_at.trim()
        ? new Date(activity_at)
        : new Date();

    await pool.query(
      `INSERT INTO lead_followups
        (lead_id, activity_type, activity_note, activity_at, next_followup_at, created_by)
       VALUES (?,?,?,?,?,?)`,
      [
        leadId,
        activity_type || 'other',
        activity_note || null,
        at,
        next_followup_at || null,
        req.user && req.user.id ? req.user.id : null,
      ]
    );

    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
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

router.put('/:id/assignments', async (req, res, next) => {
  try {
    const leadId = req.params.id;
    const body = req.body || {};
    const user_ids = Array.isArray(body.user_ids) ? body.user_ids : [];
    const primary_id = body.primary_id ? Number(body.primary_id) : null;

    // আগে সব assignment ডিলিট করে নিচ্ছি
    await pool.query('DELETE FROM lead_assignments WHERE lead_id = ?', [leadId]);

    if (!user_ids.length && !primary_id) {
      return res.status(204).end();
    }

    // primary + অতিরিক্তদের একসাথে সেট বানাচ্ছি
    const all = new Set(user_ids.map((id) => Number(id)));
    if (primary_id) all.add(primary_id);

    const values = [];
    for (const uid of all) {
      const isPrimary = primary_id && uid === primary_id ? 1 : 0;
      values.push([leadId, uid, isPrimary]);
    }

    await pool.query(
      'INSERT INTO lead_assignments (lead_id, user_id, is_primary) VALUES ?',
      [values]
    );

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// GET /api/leads/:id/followups  -> follow-up history timeline
router.get('/:id/followups', async (req, res, next) => {
  try {
    const leadId = req.params.id;

    const [rows] = await pool.query(
      `
      SELECT
        f.id,
        f.lead_id,
        f.activity_type,
        f.activity_note,
        f.activity_at,
        f.next_followup_at,
        f.created_at,
        u.name AS created_by_name
      FROM lead_followups f
      LEFT JOIN users u ON u.id = f.created_by
      WHERE f.lead_id = ?
      ORDER BY f.activity_at DESC, f.id DESC
      `,
      [leadId]
    );

    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
