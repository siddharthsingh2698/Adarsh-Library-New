// Runs every minute — detects students checked in past their slot end time
// Sends WhatsApp notification once per overtime event (tracks sent via DB)

const cron       = require('node-cron');
const db         = require('../config/database');
const { sendWhatsApp } = require('../services/whatsapp');

// Add overtime_notified column if missing (runs once on startup)
async function ensureOvertimeColumn() {
  const [cols] = await db.execute("SHOW COLUMNS FROM checkins LIKE 'overtime_notified'");
  if (!cols.length) {
    await db.execute('ALTER TABLE checkins ADD COLUMN overtime_notified TINYINT(1) DEFAULT 0');
    console.log('[OvertimeChecker] Added overtime_notified column');
  }
}

async function checkOvertime() {
  const now = new Date();
  const timeNow = now.toTimeString().slice(0, 8); // HH:MM:SS

  // Find active check-ins where current time > slot end_time AND not yet notified
  const rows = await db.q(
    `SELECT c.id, c.student_id, c.slot_id,
            s.name AS student_name, s.phone,
            ts.name AS slot_name, ts.end_time,
            se.seat_number
     FROM checkins c
     JOIN students s  ON s.id  = c.student_id
     JOIN time_slots ts ON ts.id = c.slot_id
     LEFT JOIN seats se ON se.id = c.seat_id
     WHERE c.check_out_at IS NULL
       AND c.slot_id IS NOT NULL
       AND c.overtime_notified = 0
       AND ? > ts.end_time`,
    [timeNow]
  );

  for (const row of rows) {
    console.log(`[OvertimeChecker] ${row.student_name} is overtime on ${row.slot_name} (ended ${row.end_time})`);

    // Mark notified so we don't spam
    await db.q('UPDATE checkins SET overtime_notified = 1 WHERE id = ?', [row.id]);

    // Log notification in DB
    await db.q(
      `INSERT INTO notifications (id, student_id, type, channel, message, status)
       VALUES (UUID(), ?, 'seat_alarm', 'sms', ?, 'sent')`,
      [
        row.student_id,
        `⏰ Your ${row.slot_name} slot has ended. Please vacate seat ${row.seat_number || ''} at Adarsh Library. Thank you!`
      ]
    );

    // Send WhatsApp
    if (row.phone) {
      await sendWhatsApp(
        row.phone,
        `⏰ *Adarsh Library Alert*\n\nHi ${row.student_name}, your *${row.slot_name}* slot has ended.\n\nPlease vacate seat *${row.seat_number || 'your seat'}* at the earliest.\n\nThank you! 🙏`
      );
    }
  }

  if (rows.length) {
    console.log(`[OvertimeChecker] Notified ${rows.length} student(s)`);
  }
}

function startOvertimeChecker() {
  ensureOvertimeColumn().catch(console.error);

  // Run every minute
  cron.schedule('* * * * *', () => {
    checkOvertime().catch(e => console.error('[OvertimeChecker ERROR]', e.message));
  });

  console.log('[OvertimeChecker] Started — checking every minute');
}

module.exports = { startOvertimeChecker };
