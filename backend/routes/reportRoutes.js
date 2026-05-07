const express = require('express');
const db      = require('../config/database');
const auth    = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// GET /api/v1/reports/revenue
router.get('/revenue', auth, asyncHandler(async (req, res) => {
  const rows = await db.q(
    `SELECT
       DATE_FORMAT(due_date,'%Y-%m') AS month,
       SUM(CASE WHEN status = 'paid'                 THEN amount ELSE 0 END) AS collected,
       SUM(CASE WHEN status IN ('pending','overdue') THEN amount ELSE 0 END) AS pending,
       COUNT(*) AS total_records
     FROM fees
     WHERE deleted_at IS NULL
     GROUP BY DATE_FORMAT(due_date,'%Y-%m')
     ORDER BY month DESC
     LIMIT 12`
  );
  res.json({ success: true, data: rows });
}));

// GET /api/v1/reports/occupancy
router.get('/occupancy', auth, asyncHandler(async (req, res) => {
  const rows = await db.q(
    `SELECT ts.name AS slot, ts.capacity,
            COUNT(sa.id) AS enrolled,
            ROUND(COUNT(sa.id) / NULLIF(ts.capacity,0) * 100, 1) AS fill_rate
     FROM time_slots ts
     LEFT JOIN seat_allotments sa ON sa.slot_id = ts.id AND sa.is_active = 1
     WHERE ts.is_active = 1
     GROUP BY ts.id, ts.name, ts.capacity
     ORDER BY ts.start_time`
  );
  res.json({ success: true, data: rows });
}));

// GET /api/v1/reports/attendance
router.get('/attendance', auth, asyncHandler(async (req, res) => {
  const { month, student_id } = req.query;
  const target = month || new Date().toISOString().slice(0, 7);
  const where  = student_id ? 'AND c.student_id = ?' : '';
  const params = student_id ? [target, student_id] : [target];

  const rows = await db.q(
    `SELECT s.id, s.name, s.phone,
            COUNT(c.id) AS days_present,
            ROUND(COUNT(c.id) / DAY(LAST_DAY(STR_TO_DATE(CONCAT(?, '-01'), '%Y-%m-%d'))) * 100, 1) AS attendance_pct
     FROM students s
     LEFT JOIN checkins c
       ON c.student_id = s.id
       AND DATE_FORMAT(c.check_in_at,'%Y-%m') = ?
     WHERE s.deleted_at IS NULL AND s.status = 'active'
     ${where}
     GROUP BY s.id, s.name, s.phone
     ORDER BY attendance_pct DESC`,
    [target, target, ...params.slice(1)]
  );
  res.json({ success: true, data: rows });
}));

module.exports = router;
