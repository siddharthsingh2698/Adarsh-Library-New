const express = require('express');
const db      = require('../config/database');
const auth    = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// GET /api/v1/notifications
router.get('/', auth, asyncHandler(async (req, res) => {
  const { page = 1, limit = 30, type } = req.query;
  const pageNum  = parseInt(page)  || 1;
  const limitNum = parseInt(limit) || 30;
  const offset   = (pageNum - 1) * limitNum;
  const where    = type ? 'WHERE n.type = ?' : '';
  const params   = type ? [type, limitNum, offset] : [limitNum, offset];

  const rows = await db.q(
    `SELECT n.*, s.name AS student_name
     FROM notifications n
     LEFT JOIN students s ON s.id = n.student_id
     ${where}
     ORDER BY n.sent_at DESC
     LIMIT ${limitNum} OFFSET ${offset}`,
    type ? [type] : []
  );
  res.json({ success: true, data: rows });
}));

// POST /api/v1/notifications/broadcast
router.post('/broadcast', auth, asyncHandler(async (req, res) => {
  const { message, channel = 'email', student_ids } = req.body;
  if (!message)
    return res.status(400).json({ success: false, message: 'message required' });

  let targets;
  if (student_ids && student_ids.length) {
    const placeholders = student_ids.map(() => '?').join(',');
    targets = await db.q(
      `SELECT id FROM students WHERE id IN (${placeholders}) AND status = 'active' AND deleted_at IS NULL`,
      student_ids
    );
  } else {
    targets = await db.q(
      "SELECT id FROM students WHERE status = 'active' AND deleted_at IS NULL"
    );
  }

  for (const t of targets) {
    await db.q(
      "INSERT INTO notifications (id, student_id, type, channel, message, status) VALUES (UUID(),?,'broadcast',?,?,'sent')",
      [t.id, channel, message]
    );
  }

  res.json({ success: true, message: `Broadcast sent to ${targets.length} students` });
}));

module.exports = router;
