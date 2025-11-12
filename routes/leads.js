const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const { parse } = require('csv-parse/sync');

router.use(requireAuth);

/* ---------- List + search + pagination ---------- */
router.get('/', async (req, res) => {
  const q = (req.query.q || '').trim();
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '10', 10), 1), 100);

  const where = [];
  const params = [];
  if (q) {
    where.push(`(
      prospect_name LIKE ? OR primary_email LIKE ? OR primary_mobile LIKE ? OR
      project_name LIKE ? OR interested_item LIKE ? OR zone LIKE ?
    )`);
    for (let i = 0; i < 6; i++) params.push(`%${q}%`);
  }
  const whereSql = where.length ? ('WHERE ' + where.join(' AND ')) : '';

  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM leads ${whereSql}`, params);
  const offset = (page - 1) * pageSize;

  const [rows] = await pool.query(
    `SELECT * FROM leads ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );

  res.json({ data: rows, total, page, pageSize });
});

/* ---------- Create base lead ---------- */
router.post('/', async (req, res) => {
  const b = req.body || {};
  if (!b.prospect_name || !b.primary_mobile) {
    return res.status(400).json({ error: 'Prospect name & primary mobile required' });
  }
  const [r] = await pool.query(
    `INSERT INTO leads
     (prospect_type, prospect_name, primary_email, primary_mobile,
      project_name, already_client, priority, interested_item, zone, status,
      campaign, contacted_by, info_source, important_note, owner_id)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      b.prospect_type || 'Individual',
      b.prospect_name,
      b.primary_email || null,
      b.primary_mobile,
      b.project_name || null,
      b.already_client ? 1 : 0,
      b.priority || 'Normal',
      b.interested_item || null,
      b.zone || null,
      b.status || 'New',
      b.campaign || null,
      b.contacted_by || null,
      b.info_source || null,
      b.important_note || null,
      req.user?.id || null
    ]
  );
  const [rows] = await pool.query('SELECT * FROM leads WHERE id=?', [r.insertId]);
  res.status(201).json({ data: rows[0] });
});

/* ---------- Sub-sections: upsert helpers (PRIMARY KEY = lead_id) ---------- */
async function upsert(table, id, cols, values) {
  const fields = cols.join(',');
  const placeholders = cols.map(() => '?').join(',');
  const updates = cols.map(c => `${c}=VALUES(${c})`).join(',');
  const sql = `INSERT INTO ${table} (lead_id, ${fields}) VALUES (?, ${placeholders})
               ON DUPLICATE KEY UPDATE ${updates}`;
  await pool.query(sql, [id, ...values]);
}

router.put('/:id/personal', async (req, res) => {
  const b = req.body || {};
  await upsert('lead_personal', req.params.id,
    ['dob','gender','nid','address_line1','address_line2','city','postal_code'],
    [b.dob || null, b.gender || null, b.nid || null, b.address_line1 || null, b.address_line2 || null, b.city || null, b.postal_code || null]
  );
  res.json({ ok: true });
});

router.put('/:id/communication', async (req, res) => {
  const b = req.body || {};
  await upsert('lead_communication', req.params.id,
    ['preferred_channel','whatsapp','facebook','last_contact_at','notes'],
    [b.preferred_channel || null, b.whatsapp || null, b.facebook || null, b.last_contact_at || null, b.notes || null]
  );
  res.json({ ok: true });
});

router.put('/:id/job', async (req, res) => {
  const b = req.body || {};
  await upsert('lead_job', req.params.id,
    ['profession','organization','designation','income'],
    [b.profession || null, b.organization || null, b.designation || null, b.income || null]
  );
  res.json({ ok: true });
});

router.put('/:id/influencer', async (req, res) => {
  const b = req.body || {};
  await upsert('lead_influencer', req.params.id,
    ['is_influenced','influencer_name','influencer_contact','relation','notes'],
    [b.is_influenced ? 1 : 0, b.influencer_name || null, b.influencer_contact || null, b.relation || null, b.notes || null]
  );
  res.json({ ok: true });
});

/* ---------- Assignments (multi-select) ---------- */
router.put('/:id/assignments', async (req, res) => {
  const { user_ids = [], primary_id = null } = req.body || {};
  await pool.query('DELETE FROM lead_assignments WHERE lead_id=?', [req.params.id]);
  for (const uid of Array.isArray(user_ids) ? user_ids : []) {
    await pool.query('INSERT INTO lead_assignments (lead_id, user_id, is_primary) VALUES (?,?,?)',
      [req.params.id, uid, primary_id && Number(primary_id) === Number(uid) ? 1 : 0]
    );
  }
  res.json({ ok: true, count: user_ids.length });
});

/* ---------- Bulk Template & Upload ---------- */
router.get('/template', async (req, res) => {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="leads_template.csv"');
  res.send([
    'prospect_name,primary_mobile,primary_email,project_name,priority,status,zone,interested_item,campaign,info_source,contacted_by,important_note,already_client'
  ].join('\n'));
});

router.post('/bulk', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'CSV file required' });
  const csv = req.file.buffer.toString('utf8');
  let records;
  try {
    records = parse(csv, { columns: true, skip_empty_lines: true, trim: true });
  } catch (e) {
    return res.status(400).json({ error: 'Invalid CSV: ' + e.message });
  }

  let inserted = 0, errors = [];
  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    if (!r.prospect_name || !r.primary_mobile) {
      errors.push(`Row ${i + 2}: name & mobile required`);
      continue;
    }
    try {
      await pool.query(
        `INSERT INTO leads
         (prospect_type, prospect_name, primary_email, primary_mobile, project_name, already_client,
          priority, interested_item, zone, status, campaign, contacted_by, info_source, important_note, owner_id)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          'Individual',
          r.prospect_name, r.primary_email || null, r.primary_mobile,
          r.project_name || null, r.already_client && String(r.already_client).toLowerCase() === 'true' ? 1 : 0,
          r.priority || 'Normal', r.interested_item || null, r.zone || null, r.status || 'New',
          r.campaign || null, r.contacted_by || null, r.info_source || null, r.important_note || null,
          req.user?.id || null
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

// routes/leads.js (নিচের দুটো রাউট যোগ/আপডেট)
router.get('/metrics', async (req, res) => {
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM leads');
    const [[{ today }]] = await pool.query('SELECT COUNT(*) AS today FROM leads WHERE DATE(created_at)=CURDATE()');
    const [[{ last7 }]] = await pool.query('SELECT COUNT(*) AS last7 FROM leads WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)');
    res.json({ total, today, last7 });
});
  
router.get('/stats', async (req, res) => {
    const [byStatus] = await pool.query('SELECT status AS k, COUNT(*) AS v FROM leads GROUP BY status ORDER BY v DESC');
    const [byPriority] = await pool.query('SELECT priority AS k, COUNT(*) AS v FROM leads GROUP BY priority ORDER BY FIELD(priority,"High","Normal","Low"), v DESC');
    const [bySource] = await pool.query('SELECT COALESCE(info_source,"(Unknown)") AS k, COUNT(*) AS v FROM leads GROUP BY info_source ORDER BY v DESC LIMIT 8');
    const [trend14] = await pool.query(`
        SELECT DATE(created_at) AS d, COUNT(*) AS v
        FROM leads
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
        GROUP BY DATE(created_at) ORDER BY d ASC
    `);
    const [recent] = await pool.query(`
        SELECT id, prospect_name, primary_mobile, status, created_at
        FROM leads ORDER BY created_at DESC LIMIT 10
    `);
    res.json({ byStatus, byPriority, bySource, trend14, recent });
});
  

module.exports = router;
