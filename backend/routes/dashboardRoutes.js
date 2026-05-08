const express = require('express');
const db      = require('../config/database');
const auth    = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/', auth, asyncHandler(async (req, res) => {
  const [occupancy, dues, students, recentCheckins, slotStats] = await Promise.all([
    db.q(`SELECT
            COUNT(*) AS checked_in,
            (SELECT COUNT(*) FROM seats WHERE status != 'maintenance') AS total_seats
          FROM checkins WHERE check_out_at IS NULL`),
    db.q(`SELECT
            COUNT(DISTINCT f.student_id) AS students_with_dues,
            COALESCE(SUM(f.amount),0)    AS total_due
          FROM fees f
          JOIN students s ON s.id = f.student_id
          WHERE f.status IN ('pending','overdue') AND f.deleted_at IS NULL
            AND s.status = 'active' AND s.deleted_at IS NULL`),
    db.q(`SELECT
            COUNT(*) AS total,
            SUM(status = 'active') AS active
          FROM students WHERE deleted_at IS NULL`),
    db.q(`SELECT c.id, c.check_in_at, c.check_out_at, c.method,
                 s.name AS student_name, s.photo_url,
                 se.seat_number, ts.name AS slot_name
          FROM checkins c
          JOIN students s ON s.id = c.student_id
          LEFT JOIN seats se ON se.id = c.seat_id
          LEFT JOIN time_slots ts ON ts.id = c.slot_id
          ORDER BY c.check_in_at DESC LIMIT 10`),
    db.q(`SELECT ts.id, ts.name, ts.capacity,
                 COUNT(sa.id) AS enrolled
          FROM time_slots ts
          LEFT JOIN seat_allotments sa ON sa.slot_id = ts.id AND sa.is_active = 1
          WHERE ts.is_active = 1
          GROUP BY ts.id, ts.name, ts.capacity
          ORDER BY ts.start_time`),
  ]);

  const occ = occupancy[0];
  const pct = occ.total_seats > 0 ? Math.round((occ.checked_in / occ.total_seats) * 100) : 0;

  res.json({
    success: true,
    data: {
      occupancy: { checked_in: +occ.checked_in, total_seats: +occ.total_seats, percentage: pct },
      dues:      { students_with_dues: +dues[0].students_with_dues, total_due: +dues[0].total_due },
      students:  { total: +students[0].total, active: +students[0].active },
      recent_checkins: recentCheckins,
      slot_stats: slotStats,
    }
  });
}));

module.exports = router;
