const express = require('express');
const db      = require('../config/database');
const auth    = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// GET /api/v1/seats/map?slot_id=
router.get('/map', auth, asyncHandler(async (req, res) => {
  const { slot_id } = req.query;
  const slotJoin = slot_id
    ? 'LEFT JOIN seat_allotments sa ON sa.seat_id = se.id AND sa.is_active = 1 AND sa.slot_id = ?'
    : 'LEFT JOIN seat_allotments sa ON sa.seat_id = se.id AND sa.is_active = 1';
  const params = slot_id ? [slot_id] : [];

  const rows = await db.q(
    `SELECT se.*,
       sa.id AS allotment_id, sa.student_id,
       st.name AS student_name, st.phone AS student_phone,
       CASE
         WHEN se.status = 'maintenance' THEN 'maintenance'
         WHEN sa.id IS NOT NULL THEN 'occupied'
         ELSE 'available'
       END AS slot_status
     FROM seats se
     ${slotJoin}
     LEFT JOIN students st ON st.id = sa.student_id
     ORDER BY CAST(se.seat_number AS UNSIGNED)`,
    params
  );
  res.json({ success: true, data: rows });
}));

// GET /api/v1/seats
router.get('/', auth, asyncHandler(async (req, res) => {
  const rows = await db.q('SELECT * FROM seats ORDER BY row_num, col_num');
  res.json({ success: true, data: rows });
}));

// POST /api/v1/seats/bulk
router.post('/bulk', auth, asyncHandler(async (req, res) => {
  const { rows: numRows, cols, zone } = req.body;
  if (!numRows || !cols)
    return res.status(400).json({ success: false, message: 'rows and cols required' });

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let created = 0;
  for (let r = 0; r < numRows; r++) {
    for (let c = 1; c <= cols; c++) {
      const seatNum = `${letters[r]}${c}`;
      try {
        await db.q(
          'INSERT IGNORE INTO seats (id, seat_number, row_num, col_num, zone) VALUES (UUID(),?,?,?,?)',
          [seatNum, r+1, c, zone||'Main Hall']
        );
        created++;
      } catch (_) {}
    }
  }
  res.status(201).json({ success: true, message: `${created} seats created` });
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
router.post('/allotments', auth, asyncHandler(async (req, res) => {
  const { student_id, seat_id, slot_id, start_date, end_date } = req.body;
  if (!student_id || !seat_id || !slot_id || !start_date || !end_date)
    return res.status(400).json({ success: false, message: 'All fields required' });

  const existing = await db.q(
    'SELECT id FROM seat_allotments WHERE student_id = ? AND is_active = 1', [student_id]
  );
  if (existing.length)
    return res.status(409).json({ success: false, message: 'Student already has an active seat allotment' });

  const taken = await db.q(
    'SELECT id FROM seat_allotments WHERE seat_id = ? AND slot_id = ? AND is_active = 1', [seat_id, slot_id]
  );
  if (taken.length)
    return res.status(409).json({ success: false, message: 'Seat already occupied in this slot' });

  await db.q(
    'INSERT INTO seat_allotments (id, student_id, seat_id, slot_id, start_date, end_date) VALUES (UUID(),?,?,?,?,?)',
    [student_id, seat_id, slot_id, start_date, end_date]
  );
  await db.q("UPDATE seats SET status = 'occupied' WHERE id = ?", [seat_id]);

  // Auto-create a pending fee record from the slot's monthly fee
  const slotRows = await db.q('SELECT monthly_fee FROM time_slots WHERE id = ?', [slot_id]);
  if (slotRows.length && slotRows[0].monthly_fee > 0) {
    await db.q(
      `INSERT INTO fees (id, student_id, slot_id, amount, due_date, status)
       VALUES (UUID(), ?, ?, ?, ?, 'pending')`,
      [student_id, slot_id, slotRows[0].monthly_fee, end_date]
    );
  }

  const rows = await db.q('SELECT * FROM seat_allotments ORDER BY created_at DESC LIMIT 1');
  res.status(201).json({ success: true, data: rows[0] });
}));

// DELETE /api/v1/seats/allotments/:id
router.delete('/allotments/:id', auth, asyncHandler(async (req, res) => {
  const rows = await db.q('SELECT seat_id FROM seat_allotments WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ success: false, message: 'Allotment not found' });

  await db.q('UPDATE seat_allotments SET is_active = 0 WHERE id = ?', [req.params.id]);

  const others = await db.q(
    'SELECT id FROM seat_allotments WHERE seat_id = ? AND is_active = 1', [rows[0].seat_id]
  );
  if (!others.length)
    await db.q("UPDATE seats SET status = 'available' WHERE id = ?", [rows[0].seat_id]);

  res.json({ success: true, message: 'Seat released' });
}));

module.exports = router;
