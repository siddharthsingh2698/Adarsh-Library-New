const express = require('express');
const db      = require('../config/database');
const auth    = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/', auth, asyncHandler(async (req, res) => {
  const rows = await db.q(
    `SELECT l.*,
       la.id AS allotment_id, la.student_id, la.key_given, la.start_date, la.end_date,
       s.name AS student_name
     FROM lockers l
     LEFT JOIN locker_allotments la ON la.locker_id = l.id AND la.is_active = 1
     LEFT JOIN students s ON s.id = la.student_id
     ORDER BY l.locker_number`
  );
  res.json({ success: true, data: rows });
}));

router.post('/', auth, asyncHandler(async (req, res) => {
  const { locker_number, monthly_fee } = req.body;
  if (!locker_number)
    return res.status(400).json({ success: false, message: 'locker_number required' });
  await db.q('INSERT INTO lockers (id, locker_number, monthly_fee) VALUES (UUID(),?,?)', [locker_number, monthly_fee||0]);
  const rows = await db.q('SELECT * FROM lockers ORDER BY created_at DESC LIMIT 1');
  res.status(201).json({ success: true, data: rows[0] });
}));

router.put('/:id', auth, asyncHandler(async (req, res) => {
  const { status, monthly_fee } = req.body;
  await db.q(
    'UPDATE lockers SET status = COALESCE(?,status), monthly_fee = COALESCE(?,monthly_fee) WHERE id = ?',
    [status, monthly_fee, req.params.id]
  );
  const rows = await db.q('SELECT * FROM lockers WHERE id = ?', [req.params.id]);
  res.json({ success: true, data: rows[0] });
}));

router.post('/allotments', auth, asyncHandler(async (req, res) => {
  const { student_id, locker_id, start_date, end_date } = req.body;
  if (!student_id || !locker_id || !start_date || !end_date)
    return res.status(400).json({ success: false, message: 'All fields required' });

  const existing = await db.q('SELECT id FROM locker_allotments WHERE student_id = ? AND is_active = 1', [student_id]);
  if (existing.length)
    return res.status(409).json({ success: false, message: 'Student already has a locker' });

  const taken = await db.q('SELECT id FROM locker_allotments WHERE locker_id = ? AND is_active = 1', [locker_id]);
  if (taken.length)
    return res.status(409).json({ success: false, message: 'Locker already assigned' });

  await db.q(
    'INSERT INTO locker_allotments (id, student_id, locker_id, start_date, end_date) VALUES (UUID(),?,?,?,?)',
    [student_id, locker_id, start_date, end_date]
  );
  await db.q("UPDATE lockers SET status = 'assigned' WHERE id = ?", [locker_id]);

  const rows = await db.q('SELECT * FROM locker_allotments ORDER BY created_at DESC LIMIT 1');
  res.status(201).json({ success: true, data: rows[0] });
}));

router.put('/allotments/:id', auth, asyncHandler(async (req, res) => {
  const { key_given } = req.body;
  await db.q('UPDATE locker_allotments SET key_given = ? WHERE id = ?', [key_given, req.params.id]);
  const rows = await db.q('SELECT * FROM locker_allotments WHERE id = ?', [req.params.id]);
  res.json({ success: true, data: rows[0] });
}));

router.delete('/allotments/:id', auth, asyncHandler(async (req, res) => {
  const rows = await db.q('SELECT locker_id FROM locker_allotments WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ success: false, message: 'Allotment not found' });
  await db.q('UPDATE locker_allotments SET is_active = 0 WHERE id = ?', [req.params.id]);
  await db.q("UPDATE lockers SET status = 'available' WHERE id = ?", [rows[0].locker_id]);
  res.json({ success: true, message: 'Locker released' });
}));

module.exports = router;
