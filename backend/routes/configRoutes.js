const express = require('express');
const db      = require('../config/database');
const auth    = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// GET /api/v1/config
router.get('/', auth, asyncHandler(async (req, res) => {
  const rows = await db.q('SELECT * FROM library_config LIMIT 1');
  res.json({ success: true, data: rows[0] || {} });
}));

// PUT /api/v1/config
router.put('/', auth, asyncHandler(async (req, res) => {
  const { library_name, logo_url, open_time, close_time,
          open_days, fee_reminder_days, notification_channel } = req.body;

  const existing = await db.q('SELECT id FROM library_config LIMIT 1');

  if (existing.length) {
    await db.q(
      `UPDATE library_config SET
         library_name         = COALESCE(?, library_name),
         logo_url             = COALESCE(?, logo_url),
         open_time            = COALESCE(?, open_time),
         close_time           = COALESCE(?, close_time),
         open_days            = COALESCE(?, open_days),
         fee_reminder_days    = COALESCE(?, fee_reminder_days),
         notification_channel = COALESCE(?, notification_channel)
       WHERE id = ?`,
      [library_name, logo_url, open_time, close_time,
       open_days            ? JSON.stringify(open_days)         : null,
       fee_reminder_days    ? JSON.stringify(fee_reminder_days) : null,
       notification_channel, existing[0].id]
    );
  } else {
    await db.q(
      `INSERT INTO library_config
         (id, library_name, logo_url, open_time, close_time, open_days, fee_reminder_days, notification_channel)
       VALUES (UUID(),?,?,?,?,?,?,?)`,
      [library_name||'Adarsh Library', logo_url||null,
       open_time||'06:00:00', close_time||'22:00:00',
       JSON.stringify(open_days||['Mon','Tue','Wed','Thu','Fri']),
       JSON.stringify(fee_reminder_days||[7,3,1]),
       notification_channel||'email']
    );
  }

  const rows = await db.q('SELECT * FROM library_config LIMIT 1');
  res.json({ success: true, data: rows[0] });
}));

module.exports = router;
