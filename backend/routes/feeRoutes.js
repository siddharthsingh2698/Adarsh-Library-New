const express = require('express');
const db      = require('../config/database');
const auth    = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// GET /api/v1/fees
router.get('/', auth, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, student_id, month } = req.query;
  const pageNum  = parseInt(page)  || 1;
  const limitNum = parseInt(limit) || 20;
  const offset   = (pageNum - 1) * limitNum;
  const where  = ['f.deleted_at IS NULL'];
  const params = [];

  if (status)     { where.push('f.status = ?');                        params.push(status); }
  if (student_id) { where.push('f.student_id = ?');                    params.push(student_id); }
  if (month)      { where.push("DATE_FORMAT(f.due_date,'%Y-%m') = ?"); params.push(month); }

  const whereStr = 'WHERE ' + where.join(' AND ');

  const countRows = await db.q(`SELECT COUNT(*) AS total FROM fees f ${whereStr}`, params);

  const rows = await db.q(
    `SELECT f.*, s.name AS student_name, s.phone AS student_phone, ts.name AS slot_name
     FROM fees f
     JOIN students s ON s.id = f.student_id
     LEFT JOIN time_slots ts ON ts.id = f.slot_id
     ${whereStr}
     ORDER BY f.due_date DESC
     LIMIT ${limitNum} OFFSET ${offset}`,
    params
  );

  res.json({
    success: true,
    data: rows,
    pagination: { total: +countRows[0].total, page: pageNum, limit: limitNum }
  });
}));

// GET /api/v1/fees/outstanding
router.get('/outstanding', auth, asyncHandler(async (req, res) => {
  const rows = await db.q(
    `SELECT s.id AS student_id, s.name, s.phone, s.email,
            COUNT(f.id)   AS due_count,
            SUM(f.amount) AS total_due,
            MIN(f.due_date) AS oldest_due
     FROM fees f
     JOIN students s ON s.id = f.student_id
     WHERE f.status IN ('pending','overdue') AND f.deleted_at IS NULL
     GROUP BY s.id, s.name, s.phone, s.email
     ORDER BY oldest_due ASC`
  );
  res.json({ success: true, data: rows });
}));

// GET /api/v1/fees/summary
router.get('/summary', auth, asyncHandler(async (req, res) => {
  const target = req.query.month || new Date().toISOString().slice(0, 7);
  const rows = await db.q(
    `SELECT
       SUM(CASE WHEN status = 'paid'                    THEN amount ELSE 0 END) AS collected,
       SUM(CASE WHEN status IN ('pending','overdue')    THEN amount ELSE 0 END) AS pending,
       SUM(status = 'paid')                                                     AS paid_count,
       SUM(status IN ('pending','overdue'))                                     AS pending_count
     FROM fees
     WHERE DATE_FORMAT(due_date,'%Y-%m') = ? AND deleted_at IS NULL`,
    [target]
  );
  res.json({ success: true, data: rows[0] });
}));

// POST /api/v1/fees
router.post('/', auth, asyncHandler(async (req, res) => {
  const { student_id, slot_id, locker_id, amount, due_date,
          paid_date, payment_mode, reference, status, notes } = req.body;

  if (!student_id || !amount || !due_date)
    return res.status(400).json({ success: false, message: 'student_id, amount, due_date required' });

  await db.q(
    `INSERT INTO fees (id, student_id, slot_id, locker_id, amount, due_date,
                       paid_date, payment_mode, reference, status, notes)
     VALUES (UUID(),?,?,?,?,?,?,?,?,?,?)`,
    [student_id, slot_id||null, locker_id||null, amount, due_date,
     paid_date||null, payment_mode||null, reference||null,
     status || (paid_date ? 'paid' : 'pending'), notes||null]
  );

  const rows = await db.q('SELECT * FROM fees ORDER BY created_at DESC LIMIT 1');
  res.status(201).json({ success: true, data: rows[0] });
}));

// PUT /api/v1/fees/:id
router.put('/:id', auth, asyncHandler(async (req, res) => {
  const { amount, paid_date, payment_mode, reference, status, notes } = req.body;
  await db.q(
    `UPDATE fees SET
       amount       = COALESCE(?, amount),
       paid_date    = COALESCE(?, paid_date),
       payment_mode = COALESCE(?, payment_mode),
       reference    = COALESCE(?, reference),
       status       = COALESCE(?, status),
       notes        = COALESCE(?, notes)
     WHERE id = ? AND deleted_at IS NULL`,
    [amount, paid_date, payment_mode, reference, status, notes, req.params.id]
  );
  const rows = await db.q('SELECT * FROM fees WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ success: false, message: 'Fee not found' });
  res.json({ success: true, data: rows[0] });
}));

// GET /api/v1/fees/:id/receipt
router.get('/:id/receipt', auth, asyncHandler(async (req, res) => {
  const rows = await db.q(
    `SELECT f.*, s.name AS student_name, s.phone, s.email,
            ts.name AS slot_name, lo.locker_number
     FROM fees f
     JOIN students s ON s.id = f.student_id
     LEFT JOIN time_slots ts ON ts.id = f.slot_id
     LEFT JOIN lockers lo ON lo.id = f.locker_id
     WHERE f.id = ?`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ success: false, message: 'Fee not found' });
  res.json({ success: true, data: rows[0] });
}));

module.exports = router;
