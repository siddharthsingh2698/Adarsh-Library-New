const express = require('express');
const db      = require('../config/database');
const auth    = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// GET /api/v1/students
router.get('/', auth, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, status, slot_id } = req.query;
  const pageNum   = parseInt(page)  || 1;
  const limitNum  = parseInt(limit) || 20;
  const offset    = (pageNum - 1) * limitNum;

  let where = ['s.deleted_at IS NULL'];
  const params = [];

  if (search) {
    where.push('(s.name LIKE ? OR s.phone LIKE ? OR s.email LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (status)  { where.push('s.status = ?');                          params.push(status); }
  if (slot_id) { where.push('sa.slot_id = ? AND sa.is_active = 1');   params.push(slot_id); }

  const whereStr = 'WHERE ' + where.join(' AND ');

  const countRows = await db.q(
    `SELECT COUNT(*) AS total FROM students s
     LEFT JOIN seat_allotments sa ON sa.student_id = s.id AND sa.is_active = 1
     ${whereStr}`,
    params
  );

  const rows = await db.q(
    `SELECT s.id, s.name, s.phone, s.email, s.photo_url, s.status, s.joined_at, s.qr_code,
            sa.id AS allotment_id, sa.start_date, sa.end_date,
            se.seat_number, se.zone,
            ts.id AS slot_id, ts.name AS slot_name, ts.start_time, ts.end_time,
            (SELECT f.status FROM fees f
             WHERE f.student_id = s.id AND f.status IN ('pending','overdue') AND f.deleted_at IS NULL
             ORDER BY f.due_date DESC LIMIT 1) AS fee_status
     FROM students s
     LEFT JOIN seat_allotments sa ON sa.student_id = s.id AND sa.is_active = 1
     LEFT JOIN seats se ON se.id = sa.seat_id
     LEFT JOIN time_slots ts ON ts.id = sa.slot_id
     ${whereStr}
     ORDER BY s.created_at DESC
     LIMIT ${limitNum} OFFSET ${offset}`,
    params
  );

  res.json({
    success: true,
    data: rows,
    pagination: {
      total: +countRows[0].total,
      page:  pageNum,
      limit: limitNum,
      pages: Math.ceil(countRows[0].total / limitNum)
    }
  });
}));

// GET /api/v1/students/:id
router.get('/:id', auth, asyncHandler(async (req, res) => {
  const rows = await db.q(
    `SELECT s.*,
            sa.id AS allotment_id, sa.start_date, sa.end_date,
            se.seat_number, se.zone, se.has_power,
            ts.name AS slot_name, ts.start_time, ts.end_time, ts.monthly_fee AS slot_fee,
            la.id AS locker_allotment_id, la.key_given,
            lo.locker_number, lo.monthly_fee AS locker_fee
     FROM students s
     LEFT JOIN seat_allotments sa ON sa.student_id = s.id AND sa.is_active = 1
     LEFT JOIN seats se ON se.id = sa.seat_id
     LEFT JOIN time_slots ts ON ts.id = sa.slot_id
     LEFT JOIN locker_allotments la ON la.student_id = s.id AND la.is_active = 1
     LEFT JOIN lockers lo ON lo.id = la.locker_id
     WHERE s.id = ? AND s.deleted_at IS NULL`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ success: false, message: 'Student not found' });

  const fees = await db.q(
    `SELECT f.*, ts.name AS slot_name FROM fees f
     LEFT JOIN time_slots ts ON ts.id = f.slot_id
     WHERE f.student_id = ? AND f.deleted_at IS NULL
     ORDER BY f.due_date DESC LIMIT 12`,
    [req.params.id]
  );

  res.json({ success: true, data: { ...rows[0], fee_history: fees } });
}));

// POST /api/v1/students
router.post('/', auth, asyncHandler(async (req, res) => {
  const { name, phone, email, address, joined_at, photo_url, id_proof_url, notification_channel } = req.body;
  if (!name || !phone)
    return res.status(400).json({ success: false, message: 'Name and phone are required' });

  // Generate a UUID-like ID via MySQL
  const idRow = await db.q('SELECT UUID() AS id');
  const id = idRow[0].id;

  // Generate student login ID: alms@firstname_XXXX
  const firstName = name.trim().split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  // Find next available 4-digit suffix for this first name
  const existing = await db.q(
    "SELECT student_login_id FROM students WHERE student_login_id LIKE ? AND deleted_at IS NULL",
    [`alms@${firstName}_%`]
  );
  let suffix = 1001;
  if (existing.length) {
    const usedNums = existing.map(r => parseInt(r.student_login_id.split('_').pop())).filter(n => !isNaN(n));
    suffix = usedNums.length ? Math.max(...usedNums) + 1 : 1001;
  }
  const studentLoginId = `alms@${firstName}_${suffix}`;

  await db.q(
    `INSERT INTO students (id, name, phone, email, address, joined_at, photo_url, id_proof_url, notification_channel, qr_code, student_login_id)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [id, name, phone, email||null, address||null, joined_at||new Date().toISOString().slice(0,10),
     photo_url||null, id_proof_url||null, notification_channel||'email', `ALMS-${id}`, studentLoginId]
  );

  res.status(201).json({ success: true, message: 'Student created', data: { ...student, student_login_id: studentLoginId } });
}));

// PUT /api/v1/students/:id
router.put('/:id', auth, asyncHandler(async (req, res) => {
  const { name, phone, email, address, joined_at, photo_url, id_proof_url, status, notification_channel } = req.body;

  await db.q(
    `UPDATE students SET
       name                 = COALESCE(?, name),
       phone                = COALESCE(?, phone),
       email                = COALESCE(?, email),
       address              = COALESCE(?, address),
       joined_at            = COALESCE(?, joined_at),
       photo_url            = COALESCE(?, photo_url),
       id_proof_url         = COALESCE(?, id_proof_url),
       status               = COALESCE(?, status),
       notification_channel = COALESCE(?, notification_channel)
     WHERE id = ? AND deleted_at IS NULL`,
    [name, phone, email, address, joined_at, photo_url, id_proof_url, status, notification_channel, req.params.id]
  );

  const rows = await db.q('SELECT * FROM students WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ success: false, message: 'Student not found' });
  res.json({ success: true, message: 'Student updated', data: rows[0] });
}));

// DELETE /api/v1/students/:id  (soft delete)
router.delete('/:id', auth, asyncHandler(async (req, res) => {
  const [result] = await db.execute(
    "UPDATE students SET deleted_at = NOW(), status = 'inactive' WHERE id = ? AND deleted_at IS NULL",
    [req.params.id]
  );
  if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Student not found' });

  await db.q('UPDATE seat_allotments SET is_active = 0 WHERE student_id = ?', [req.params.id]);
  await db.q('UPDATE locker_allotments SET is_active = 0 WHERE student_id = ?', [req.params.id]);

  res.json({ success: true, message: 'Student deactivated' });
}));

module.exports = router;
