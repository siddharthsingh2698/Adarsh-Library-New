const express = require('express');
const db      = require('../config/database');
const auth    = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// GET /api/v1/checkins/live
router.get('/live', auth, asyncHandler(async (req, res) => {
  const timeNow = new Date().toTimeString().slice(0, 8);
  const rows = await db.q(
    `SELECT c.*, s.name AS student_name, s.photo_url, s.phone,
            se.seat_number, ts.name AS slot_name, ts.end_time,
            CASE WHEN ? > ts.end_time THEN 1 ELSE 0 END AS is_overtime
     FROM checkins c
     JOIN students s ON s.id = c.student_id
     LEFT JOIN seats se ON se.id = c.seat_id
     LEFT JOIN time_slots ts ON ts.id = c.slot_id
     WHERE c.check_out_at IS NULL
     ORDER BY is_overtime DESC, c.check_in_at DESC`,
    [timeNow]
  );
  res.json({ success: true, data: rows, count: rows.length });
}));

// GET /api/v1/checkins/attendance
router.get('/attendance', auth, asyncHandler(async (req, res) => {
  const { from, to, student_id, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;
  const where = [];
  const params = [];

  if (from)       { where.push('c.check_in_at >= ?'); params.push(from); }
  if (to)         { where.push('c.check_in_at <= ?'); params.push(to + ' 23:59:59'); }
  if (student_id) { where.push('c.student_id = ?');   params.push(student_id); }

  const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const rows = await db.q(
    `SELECT c.*, s.name AS student_name, se.seat_number, ts.name AS slot_name
     FROM checkins c
     JOIN students s ON s.id = c.student_id
     LEFT JOIN seats se ON se.id = c.seat_id
     LEFT JOIN time_slots ts ON ts.id = c.slot_id
     ${whereStr}
     ORDER BY c.check_in_at DESC
     LIMIT ? OFFSET ?`,
    [...params, +limit, +offset]
  );
  res.json({ success: true, data: rows });
}));

// POST /api/v1/checkins/walkin — guest sits on an absent Full Day student's seat
router.post('/walkin', asyncHandler(async (req, res) => {
  const { qr_code, seat_id } = req.body;
  if (!qr_code || !seat_id)
    return res.status(400).json({ success: false, message: 'qr_code and seat_id required' });

  // Find student
  const input = qr_code.trim();
  let students = await db.q(
    `SELECT * FROM students WHERE (qr_code = ? OR qr_code = ? OR id = ?)
     AND status = 'active' AND deleted_at IS NULL LIMIT 1`,
    [input, 'ALMS-' + input, input]
  );
  let student = students[0];
  if (!student) {
    const all = await db.q("SELECT * FROM students WHERE status = 'active' AND deleted_at IS NULL");
    student = all.find(s => s.id.toLowerCase().startsWith(input.replace(/^ALMS-/i,'').toLowerCase()));
  }
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  // Check student not already checked in
  const active = await db.q('SELECT id FROM checkins WHERE student_id = ? AND check_out_at IS NULL', [student.id]);
  if (active.length) return res.status(409).json({ success: false, message: 'Already checked in somewhere' });

  // Verify seat is a Full Day seat with absent student (reserved status)
  const todayDate = new Date().toISOString().slice(0, 10);
  const seatAllotment = await db.q(
    `SELECT sa.student_id, sa.slot_id FROM seat_allotments sa
     JOIN time_slots ts ON ts.id = sa.slot_id
     WHERE sa.seat_id = ? AND sa.is_active = 1 AND ts.is_full_day = 1`,
    [seat_id]
  );
  if (!seatAllotment.length)
    return res.status(400).json({ success: false, message: 'This seat is not a Full Day reserved seat' });

  // Check the Full Day student is NOT currently checked in
  const ownerCheckedIn = await db.q(
    `SELECT id FROM checkins WHERE student_id = ? AND seat_id = ?
     AND DATE(check_in_at) = ? AND check_out_at IS NULL`,
    [seatAllotment[0].student_id, seat_id, todayDate]
  );
  if (ownerCheckedIn.length)
    return res.status(409).json({ success: false, message: 'Seat owner is currently present' });

  // Check no other walk-in already on this seat
  const existingWalkin = await db.q(
    "SELECT id FROM checkins WHERE seat_id = ? AND check_out_at IS NULL AND method = 'walkin'",
    [seat_id]
  );
  if (existingWalkin.length)
    return res.status(409).json({ success: false, message: 'Another student is already using this seat' });

  // Create walk-in check-in
  await db.q(
    "INSERT INTO checkins (id, student_id, seat_id, slot_id, method, flagged) VALUES (UUID(),?,?,?,'walkin',0)",
    [student.id, seat_id, seatAllotment[0].slot_id]
  );

  const seat = await db.q('SELECT seat_number FROM seats WHERE id = ?', [seat_id]);

  res.json({
    success: true,
    action: 'walkin',
    message: `Walk-in check-in successful`,
    student_name: student.name,
    seat_number: seat[0]?.seat_number,
    note: 'You may be asked to vacate if the seat owner arrives'
  });
}));

// POST /api/v1/checkins/qr  — public toggle: scan once = check in, scan again = check out
router.post('/qr', asyncHandler(async (req, res) => {
  const { qr_code } = req.body;
  if (!qr_code) return res.status(400).json({ success: false, message: 'qr_code required' });

  const input = qr_code.trim();

  // Find student — accept: full QR, raw UUID, short display ID, OR phone number
  let students = await db.q(
    `SELECT * FROM students
     WHERE (qr_code = ? OR qr_code = ? OR id = ? OR phone = ?)
       AND status = 'active' AND deleted_at IS NULL
     LIMIT 1`,
    [input, 'ALMS-' + input, input, input]
  );

  let student = students[0];
  if (!student) {
    const shortMatch = input.replace(/^ALMS-/i, '').toLowerCase();
    const all = await db.q("SELECT * FROM students WHERE status = 'active' AND deleted_at IS NULL");
    student = all.find(s =>
      s.id.toLowerCase().startsWith(shortMatch.toLowerCase()) ||
      s.id.replace(/-/g,'').toLowerCase().startsWith(shortMatch.replace(/-/g,'').toLowerCase())
    );
  }

  if (!student)
    return res.status(404).json({ success: false, message: 'Student not found or inactive' });

  // Check if already checked in
  const active = await db.q(
    'SELECT * FROM checkins WHERE student_id = ? AND check_out_at IS NULL ORDER BY check_in_at DESC LIMIT 1',
    [student.id]
  );

  // ── CHECKOUT (already inside — second scan) ──────────────────────────
  if (active.length) {
    const checkin = active[0];
    await db.q('UPDATE checkins SET check_out_at = NOW() WHERE id = ?', [checkin.id]);

    // Calculate duration
    const mins = Math.floor((Date.now() - new Date(checkin.check_in_at)) / 60000);
    const dur  = mins < 60 ? `${mins} min` : `${Math.floor(mins/60)}h ${mins%60}m`;

    if (req.io) {
      req.io.emit('seat:update',     { seatId: checkin.seat_id, status: 'available' });
      req.io.emit('occupancy:update',{ slotId: checkin.slot_id });
    }

    return res.json({
      success: true,
      action: 'checkout',
      message: `Goodbye, ${student.name}!`,
      student_name: student.name,
      duration: dur,
    });
  }

  // ── CHECK IN (not inside — first scan) ───────────────────────────────
  // Pick the allotment whose slot time window matches NOW
  const allotments = await db.q(
    `SELECT sa.seat_id, sa.slot_id, se.seat_number, ts.name AS slot_name,
            ts.start_time, ts.end_time, ts.is_full_day
     FROM seat_allotments sa
     JOIN seats se ON se.id = sa.seat_id
     JOIN time_slots ts ON ts.id = sa.slot_id
     WHERE sa.student_id = ? AND sa.is_active = 1
     ORDER BY ts.is_full_day DESC, ts.start_time ASC`,
    [student.id]
  );

  const timeNow = new Date().toTimeString().slice(0, 8);

  // Prefer the allotment whose slot window contains current time
  const matchingAllotment = allotments.find(a =>
    timeNow >= a.start_time && timeNow <= a.end_time
  ) || allotments[0] || {};

  const allotment = matchingAllotment;

  let flagged = 0;
  if (allotment.start_time && allotment.end_time) {
    const now = new Date().toTimeString().slice(0, 8);
    flagged = (now < allotment.start_time || now > allotment.end_time) ? 1 : 0;
  }

  await db.q(
    'INSERT INTO checkins (id, student_id, seat_id, slot_id, method, flagged) VALUES (UUID(),?,?,?,?,?)',
    [student.id, allotment.seat_id || null, allotment.slot_id || null, 'qr', flagged]
  );

  if (req.io) {
    req.io.emit('seat:update',     { seatId: allotment.seat_id, status: 'occupied' });
    req.io.emit('occupancy:update',{ slotId: allotment.slot_id });
  }

  return res.json({
    success: true,
    action: 'checkin',
    message: flagged ? 'Checked in (outside slot time)' : 'Checked in successfully',
    student_name: student.name,
    seat_number: allotment.seat_number || null,
    slot_name: allotment.slot_name || null,
    flagged: !!flagged,
  });
}));

// POST /api/v1/checkins  (public — used by QR kiosk)
router.post('/', asyncHandler(async (req, res) => {
  const { student_id, seat_id, slot_id, method = 'manual' } = req.body;
  if (!student_id)
    return res.status(400).json({ success: false, message: 'student_id required' });

  const active = await db.q(
    'SELECT id FROM checkins WHERE student_id = ? AND check_out_at IS NULL', [student_id]
  );
  if (active.length)
    return res.status(409).json({ success: false, message: 'Student already checked in' });

  let flagged = 0;
  if (slot_id) {
    const allotment = await db.q(
      'SELECT id FROM seat_allotments WHERE student_id = ? AND slot_id = ? AND is_active = 1',
      [student_id, slot_id]
    );
    flagged = allotment.length === 0 ? 1 : 0;
  }

  await db.q(
    'INSERT INTO checkins (id, student_id, seat_id, slot_id, method, flagged) VALUES (UUID(),?,?,?,?,?)',
    [student_id, seat_id||null, slot_id||null, method, flagged]
  );

  if (req.io) {
    req.io.emit('seat:update', { seatId: seat_id, status: 'occupied' });
    req.io.emit('occupancy:update', { slotId: slot_id });
  }

  const rows = await db.q('SELECT * FROM checkins ORDER BY created_at DESC LIMIT 1');
  res.status(201).json({ success: true, data: rows[0], flagged: !!flagged });
}));

// PUT /api/v1/checkins/:id/checkout
router.put('/:id/checkout', asyncHandler(async (req, res) => {
  const rows = await db.q('SELECT * FROM checkins WHERE id = ? AND check_out_at IS NULL', [req.params.id]);
  if (!rows.length)
    return res.status(404).json({ success: false, message: 'Check-in not found or already checked out' });

  await db.q('UPDATE checkins SET check_out_at = NOW() WHERE id = ?', [req.params.id]);

  if (req.io) {
    req.io.emit('seat:update', { seatId: rows[0].seat_id, status: 'available' });
    req.io.emit('occupancy:update', { slotId: rows[0].slot_id });
  }

  res.json({ success: true, data: { ...rows[0], check_out_at: new Date() } });
}));

// GET /api/v1/checkins/export
router.get('/export', auth, asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const where = [];
  const params = [];
  if (from) { where.push('c.check_in_at >= ?'); params.push(from); }
  if (to)   { where.push('c.check_in_at <= ?'); params.push(to + ' 23:59:59'); }
  const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const rows = await db.q(
    `SELECT s.name, s.phone, se.seat_number, ts.name AS slot,
            c.check_in_at, c.check_out_at, c.method, c.flagged
     FROM checkins c
     JOIN students s ON s.id = c.student_id
     LEFT JOIN seats se ON se.id = c.seat_id
     LEFT JOIN time_slots ts ON ts.id = c.slot_id
     ${whereStr}
     ORDER BY c.check_in_at DESC`,
    params
  );

  const csv = [
    'Name,Phone,Seat,Slot,Check-In,Check-Out,Method,Flagged',
    ...rows.map(r =>
      `"${r.name}","${r.phone}","${r.seat_number||''}","${r.slot||''}","${r.check_in_at}","${r.check_out_at||''}","${r.method}","${r.flagged}"`
    )
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=attendance.csv');
  res.send(csv);
}));

module.exports = router;
