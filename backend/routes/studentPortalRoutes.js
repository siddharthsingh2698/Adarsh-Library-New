// Student portal routes — authenticated by student JWT
const express = require('express');
const db      = require('../config/database');
const jwt     = require('jsonwebtoken');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// Student auth middleware
const studentAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'student') return res.status(403).json({ success: false, message: 'Student access only' });
    req.student = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// GET /api/v1/portal/me — student's own profile + plan + seat
router.get('/me', studentAuth, asyncHandler(async (req, res) => {
  const rows = await db.q(
    `SELECT s.*,
            sa.id AS allotment_id, sa.start_date, sa.end_date, sa.plan_type, sa.duration_months,
            se.seat_number, se.zone, se.has_locker, se.has_power,
            ts.name AS slot_name, ts.start_time, ts.end_time, ts.monthly_fee, ts.is_full_day
     FROM students s
     LEFT JOIN seat_allotments sa ON sa.student_id = s.id AND sa.is_active = 1
     LEFT JOIN seats se ON se.id = sa.seat_id
     LEFT JOIN time_slots ts ON ts.id = sa.slot_id
     WHERE s.id = ? AND s.deleted_at IS NULL`,
    [req.student.studentId]
  );
  if (!rows.length) return res.status(404).json({ success: false, message: 'Student not found' });

  // Fee summary
  const fees = await db.q(
    `SELECT f.*, ts.name AS slot_name FROM fees f
     LEFT JOIN time_slots ts ON ts.id = f.slot_id
     WHERE f.student_id = ? AND f.deleted_at IS NULL
     ORDER BY f.due_date DESC LIMIT 12`,
    [req.student.studentId]
  );

  // Current check-in status
  const checkin = await db.q(
    'SELECT * FROM checkins WHERE student_id = ? AND check_out_at IS NULL ORDER BY check_in_at DESC LIMIT 1',
    [req.student.studentId]
  );

  res.json({
    success: true,
    data: {
      ...rows[0],
      fees,
      currently_checked_in: checkin.length > 0,
      checkin: checkin[0] || null
    }
  });
}));

// GET /api/v1/portal/present — who is currently in the library
router.get('/present', studentAuth, asyncHandler(async (req, res) => {
  const timeNow = new Date().toTimeString().slice(0, 8);
  const rows = await db.q(
    `SELECT s.name, s.photo_url,
            se.seat_number, se.zone,
            ts.name AS slot_name,
            c.check_in_at,
            CASE WHEN ? > ts.end_time THEN 1 ELSE 0 END AS is_overtime
     FROM checkins c
     JOIN students s ON s.id = c.student_id
     LEFT JOIN seats se ON se.id = c.seat_id
     LEFT JOIN time_slots ts ON ts.id = c.slot_id
     WHERE c.check_out_at IS NULL
     ORDER BY c.check_in_at DESC`,
    [timeNow]
  );
  res.json({ success: true, data: rows, count: rows.length });
}));

// GET /api/v1/portal/seats — live seat map (read-only)
router.get('/seats', studentAuth, asyncHandler(async (req, res) => {
  const todayDate = new Date().toISOString().slice(0, 10);
  const rows = await db.q(
    `SELECT se.seat_number, se.zone, se.has_locker, se.has_power, se.status,
            ts.name AS slot_name,
            CASE
              WHEN se.status = 'maintenance' THEN 'maintenance'
              WHEN sa.id IS NOT NULL AND ts.is_full_day = 1 AND
                   (SELECT COUNT(*) FROM checkins ci WHERE ci.student_id = sa.student_id
                    AND ci.seat_id = se.id AND DATE(ci.check_in_at) = ? AND ci.check_out_at IS NULL) > 0
                   THEN 'occupied'
              WHEN sa.id IS NOT NULL AND ts.is_full_day = 1 THEN 'reserved'
              WHEN sa.id IS NOT NULL THEN 'occupied'
              ELSE 'available'
            END AS slot_status
     FROM seats se
     LEFT JOIN seat_allotments sa ON sa.seat_id = se.id AND sa.is_active = 1
     LEFT JOIN time_slots ts ON ts.id = sa.slot_id
     ORDER BY CAST(se.seat_number AS UNSIGNED)`,
    [todayDate]
  );
  res.json({ success: true, data: rows });
}));

module.exports = router;
