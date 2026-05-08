// Runs every minute:
// 1. Detects students checked in past their slot end time → notifies
// 2. Detects Full Day students still inside 30 min before library closes → notifies

const cron = require('node-cron');
const db   = require('../config/database');
const { sendWhatsApp } = require('../services/whatsapp');

async function ensureColumns() {
  const checks = [
    ["SHOW COLUMNS FROM checkins LIKE 'overtime_notified'",
     "ALTER TABLE checkins ADD COLUMN overtime_notified TINYINT(1) DEFAULT 0"],
    ["SHOW COLUMNS FROM checkins LIKE 'closing_notified'",
     "ALTER TABLE checkins ADD COLUMN closing_notified TINYINT(1) DEFAULT 0"],
  ];
  for (const [check, alter] of checks) {
    const [cols] = await db.execute(check);
    if (!cols.length) { await db.execute(alter); }
  }
}

async function checkOvertime() {
  const timeNow = new Date().toTimeString().slice(0, 8);

  // ── 1. Slot overtime (checked in past slot end time) ─────────────────
  const overtimeRows = await db.q(
    `SELECT c.id, c.student_id, c.slot_id,
            s.name AS student_name, s.phone,
            ts.name AS slot_name, ts.end_time, ts.is_full_day,
            se.seat_number
     FROM checkins c
     JOIN students s   ON s.id  = c.student_id
     JOIN time_slots ts ON ts.id = c.slot_id
     LEFT JOIN seats se ON se.id = c.seat_id
     WHERE c.check_out_at IS NULL
       AND c.slot_id IS NOT NULL
       AND c.overtime_notified = 0
       AND ts.is_full_day = 0
       AND ? > ts.end_time`,
    [timeNow]
  );

  for (const row of overtimeRows) {
    await db.q('UPDATE checkins SET overtime_notified = 1 WHERE id = ?', [row.id]);
    const msg = `⏰ Your ${row.slot_name} slot has ended. Please vacate seat ${row.seat_number || ''} at Adarsh Library. Thank you!`;
    await db.q(
      "INSERT INTO notifications (id, student_id, type, channel, message, status) VALUES (UUID(),?,'seat_alarm','sms',?,'sent')",
      [row.student_id, msg]
    );
    if (row.phone) {
      await sendWhatsApp(row.phone,
        `⏰ *Adarsh Library Alert*\n\nHi ${row.student_name}, your *${row.slot_name}* slot has ended.\n\nPlease vacate seat *${row.seat_number || 'your seat'}* at the earliest.\n\nThank you! 🙏`
      );
    }
    console.log(`[Overtime] Notified ${row.student_name} — ${row.slot_name} ended`);
  }

  // ── 2. Full Day closing reminder (30 min before library closes) ───────
  // Get library close time
  const configRows = await db.q('SELECT close_time FROM library_config LIMIT 1');
  if (!configRows.length) return;

  const closeTime = configRows[0].close_time; // e.g. "22:00:00"
  const [ch, cm] = closeTime.split(':').map(Number);
  const closeMinutes = ch * 60 + cm;

  const [nowH, nowM] = timeNow.split(':').map(Number);
  const nowMinutes = nowH * 60 + nowM;

  // Trigger when 30 min before close
  if (nowMinutes === closeMinutes - 30) {
    const fullDayRows = await db.q(
      `SELECT c.id, c.student_id,
              s.name AS student_name, s.phone,
              se.seat_number
       FROM checkins c
       JOIN students s ON s.id = c.student_id
       JOIN time_slots ts ON ts.id = c.slot_id
       LEFT JOIN seats se ON se.id = c.seat_id
       WHERE c.check_out_at IS NULL
         AND ts.is_full_day = 1
         AND c.closing_notified = 0`
    );

    for (const row of fullDayRows) {
      await db.q('UPDATE checkins SET closing_notified = 1 WHERE id = ?', [row.id]);
      const msg = `🔔 Library closes in 30 minutes. Please wrap up and check out from seat ${row.seat_number || ''}.`;
      await db.q(
        "INSERT INTO notifications (id, student_id, type, channel, message, status) VALUES (UUID(),?,'seat_alarm','sms',?,'sent')",
        [row.student_id, msg]
      );
      if (row.phone) {
        await sendWhatsApp(row.phone,
          `🔔 *Adarsh Library*\n\nHi ${row.student_name}, the library closes in *30 minutes*.\n\nPlease wrap up and check out from seat *${row.seat_number || 'your seat'}*.\n\nSee you tomorrow! 📚`
        );
      }
      console.log(`[Closing] Notified ${row.student_name} — library closes in 30 min`);
    }
  }
}

function startOvertimeChecker() {
  ensureColumns().catch(console.error);
  cron.schedule('* * * * *', () => {
    checkOvertime().catch(e => console.error('[OvertimeChecker ERROR]', e.message));
  });
  console.log('[OvertimeChecker] Started — checking every minute');
}

module.exports = { startOvertimeChecker };
