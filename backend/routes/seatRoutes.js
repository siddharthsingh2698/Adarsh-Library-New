const express = require('express');
const db      = require('../config/database');
const auth    = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// GET /api/v1/seats/map?slot_id=
// Derives seat status from allotments — not from seats.status flag
router.get('/map', auth, asyncHandler(async (req, res) => {
  const { slot_id } = req.query;

  // Count active allotments per seat (optionally filtered by slot)
  const slotFilter = slot_id ? 'AND sa.slot_id = ?' : '';
  const params     = slot_id ? [slot_id] : [];

  const rows = await db.q(
    `SELECT se.*,
       sa.id         AS allotment_id,
       sa.student_id,
       sa.plan_type,
       sa.duration_months,
       st.name       AS student_name,
       st.phone      AS student_phone,
       ts.name       AS slot_name,
       ts.start_time,
       ts.end_time,
       ts.is_full_day,
       -- How many slots are filled for this seat
       (SELECT COUNT(*) FROM seat_allotments x WHERE x.seat_id = se.id AND x.is_active = 1) AS slots_filled,
       CASE
         WHEN se.status = 'maintenance' THEN 'maintenance'
         WHEN sa.id IS NOT NULL         THEN 'occupied'
         ELSE 'available'
       END AS slot_status
     FROM seats se
     LEFT JOIN seat_allotments sa
       ON sa.seat_id = se.id AND sa.is_active = 1 ${slotFilter}
     LEFT JOIN students st ON st.id = sa.student_id
     LEFT JOIN time_slots ts ON ts.id = sa.slot_id
     ORDER BY CAST(se.seat_number AS UNSIGNED)`,
    params
  );
  res.json({ success: true, data: rows });
}));

// GET /api/v1/seats
router.get('/', auth, asyncHandler(async (req, res) => {
  const rows = await db.q('SELECT * FROM seats ORDER BY CAST(seat_number AS UNSIGNED)');
  res.json({ success: true, data: rows });
}));

// PUT /api/v1/seats/:id
router.put('/:id', auth, asyncHandler(async (req, res) => {
  const { status, zone, has_power } = req.body;
  await db.q(
    `UPDATE seats SET
       status    = COALESCE(?, status),
       zone      = COALESCE(?, zone),
       has_power = COALESCE(?, has_power)
     WHERE id = ?`,
    [status, zone, has_power, req.params.id]
  );
  const rows = await db.q('SELECT * FROM seats WHERE id = ?', [req.params.id]);
  res.json({ success: true, data: rows[0] });
}));

// POST /api/v1/seats/allotments
// Supports: morning/afternoon/evening (seat shared across slots) and full_day (exclusive)
// Supports: duration_months (1 = monthly, 3 = quarterly) — auto-generates fee records
router.post('/allotments', auth, asyncHandler(async (req, res) => {
  const {
    student_id, seat_id, slot_id,
    start_date, end_date,
    plan_type,
    duration_months = 1
  } = req.body;

  if (!student_id || !seat_id || !slot_id || !start_date)
    return res.status(400).json({ success: false, message: 'student_id, seat_id, slot_id, start_date required' });

  // Get slot info
  const slots = await db.q('SELECT * FROM time_slots WHERE id = ?', [slot_id]);
  if (!slots.length) return res.status(404).json({ success: false, message: 'Slot not found' });
  const slot = slots[0];

  // Calculate end_date from duration_months if not provided
  const computedEndDate = end_date || (() => {
    const d = new Date(start_date);
    d.setMonth(d.getMonth() + parseInt(duration_months));
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  })();

  // ── Conflict checks ──────────────────────────────────────────────────

  // 1. Student already has this slot assigned (same student, same slot)
  const studentSlotConflict = await db.q(
    'SELECT id FROM seat_allotments WHERE student_id = ? AND slot_id = ? AND is_active = 1',
    [student_id, slot_id]
  );
  if (studentSlotConflict.length)
    return res.status(409).json({ success: false, message: 'Student already has this slot assigned' });

  // 2. Full Day is exclusive — seat can't have any other allotment
  if (slot.is_full_day) {
    const anyAllotment = await db.q(
      'SELECT id FROM seat_allotments WHERE seat_id = ? AND is_active = 1',
      [seat_id]
    );
    if (anyAllotment.length)
      return res.status(409).json({ success: false, message: 'Full Day requires an exclusive seat — this seat is already assigned' });
  }

  // 3. If seat already has a Full Day allotment, no other slot can be added
  const fullDayConflict = await db.q(
    `SELECT sa.id FROM seat_allotments sa
     JOIN time_slots ts ON ts.id = sa.slot_id
     WHERE sa.seat_id = ? AND sa.is_active = 1 AND ts.is_full_day = 1`,
    [seat_id]
  );
  if (fullDayConflict.length)
    return res.status(409).json({ success: false, message: 'Seat is reserved for Full Day — cannot add another slot' });

  // 4. Shift seats: max 3 slots (morning/afternoon/evening) per seat
  const existingSlots = await db.q(
    'SELECT COUNT(*) AS cnt FROM seat_allotments WHERE seat_id = ? AND is_active = 1',
    [seat_id]
  );
  if (existingSlots[0].cnt >= 3)
    return res.status(409).json({ success: false, message: 'Seat already has 3 slots assigned (maximum)' });

  // ── Create allotment ─────────────────────────────────────────────────
  await db.q(
    `INSERT INTO seat_allotments
       (id, student_id, seat_id, slot_id, plan_type, duration_months, start_date, end_date)
     VALUES (UUID(),?,?,?,?,?,?,?)`,
    [student_id, seat_id, slot_id,
     plan_type || slot.name.toLowerCase().replace(' ', '_'),
     parseInt(duration_months),
     start_date, computedEndDate]
  );

  // ── Auto-generate monthly fee records ────────────────────────────────
  const months = parseInt(duration_months);
  for (let m = 0; m < months; m++) {
    const dueDate = new Date(start_date);
    dueDate.setMonth(dueDate.getMonth() + m);
    await db.q(
      `INSERT INTO fees (id, student_id, slot_id, amount, due_date, status)
       VALUES (UUID(), ?, ?, ?, ?, 'pending')`,
      [student_id, slot_id, slot.monthly_fee, dueDate.toISOString().slice(0, 10)]
    );
  }

  const allotment = await db.q('SELECT * FROM seat_allotments ORDER BY created_at DESC LIMIT 1');
  res.status(201).json({
    success: true,
    data: allotment[0],
    fees_created: months,
    message: `Seat assigned for ${months} month(s). ${months} fee record(s) created.`
  });
}));

// DELETE /api/v1/seats/allotments/:id — release one slot allotment
router.delete('/allotments/:id', auth, asyncHandler(async (req, res) => {
  const rows = await db.q('SELECT seat_id FROM seat_allotments WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ success: false, message: 'Allotment not found' });

  await db.q('UPDATE seat_allotments SET is_active = 0 WHERE id = ?', [req.params.id]);

  // Only mark seat as available if NO active allotments remain
  const others = await db.q(
    'SELECT id FROM seat_allotments WHERE seat_id = ? AND is_active = 1',
    [rows[0].seat_id]
  );
  if (!others.length) {
    await db.q("UPDATE seats SET status = 'available' WHERE id = ?", [rows[0].seat_id]);
  }

  res.json({ success: true, message: 'Slot released' });
}));

module.exports = router;
