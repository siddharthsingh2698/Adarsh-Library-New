const express = require('express');
const db      = require('../config/database');
const auth    = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/', auth, asyncHandler(async (req, res) => {
  const rows = await db.q(
    `SELECT ts.*,
       (SELECT COUNT(*) FROM seat_allotments sa WHERE sa.slot_id = ts.id AND sa.is_active = 1) AS enrolled
     FROM time_slots ts WHERE ts.is_active = 1 ORDER BY ts.start_time`
  );
  res.json({ success: true, data: rows });
}));

router.post('/', auth, asyncHandler(async (req, res) => {
  const { name, start_time, end_time, monthly_fee, capacity } = req.body;
  if (!name || !start_time || !end_time)
    return res.status(400).json({ success: false, message: 'name, start_time, end_time required' });

  await db.q(
    'INSERT INTO time_slots (id, name, start_time, end_time, monthly_fee, capacity) VALUES (UUID(),?,?,?,?,?)',
    [name, start_time, end_time, monthly_fee||0, capacity||50]
  );
  const rows = await db.q('SELECT * FROM time_slots ORDER BY created_at DESC LIMIT 1');
  res.status(201).json({ success: true, data: rows[0] });
}));

router.put('/:id', auth, asyncHandler(async (req, res) => {
  const { name, start_time, end_time, monthly_fee, capacity, is_active } = req.body;
  await db.q(
    `UPDATE time_slots SET
       name        = COALESCE(?, name),
       start_time  = COALESCE(?, start_time),
       end_time    = COALESCE(?, end_time),
       monthly_fee = COALESCE(?, monthly_fee),
       capacity    = COALESCE(?, capacity),
       is_active   = COALESCE(?, is_active)
     WHERE id = ?`,
    [name, start_time, end_time, monthly_fee, capacity, is_active, req.params.id]
  );
  const rows = await db.q('SELECT * FROM time_slots WHERE id = ?', [req.params.id]);
  res.json({ success: true, data: rows[0] });
}));

router.delete('/:id', auth, asyncHandler(async (req, res) => {
  await db.q('UPDATE time_slots SET is_active = 0 WHERE id = ?', [req.params.id]);
  res.json({ success: true, message: 'Slot deactivated' });
}));

module.exports = router;
