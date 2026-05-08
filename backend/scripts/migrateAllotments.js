// Run once to add new columns to seat_allotments on Railway
// Usage: node scripts/migrateAllotments.js (with Railway env vars set)
require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '3306'),
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'adarsh_library',
    ssl: process.env.DB_HOST !== 'localhost' ? { rejectUnauthorized: false } : false,
  });

  // Add plan_type to seat_allotments
  const [cols1] = await conn.query("SHOW COLUMNS FROM seat_allotments LIKE 'plan_type'");
  if (!cols1.length) {
    await conn.query(`ALTER TABLE seat_allotments ADD COLUMN plan_type ENUM('morning','afternoon','evening','full_day') NULL AFTER slot_id`);
    console.log('✅ Added plan_type to seat_allotments');
  }

  // Add duration_months to seat_allotments
  const [cols2] = await conn.query("SHOW COLUMNS FROM seat_allotments LIKE 'duration_months'");
  if (!cols2.length) {
    await conn.query(`ALTER TABLE seat_allotments ADD COLUMN duration_months TINYINT DEFAULT 1 AFTER plan_type`);
    console.log('✅ Added duration_months to seat_allotments');
  }

  // Add is_full_day to time_slots for easy querying
  const [cols3] = await conn.query("SHOW COLUMNS FROM time_slots LIKE 'is_full_day'");
  if (!cols3.length) {
    await conn.query(`ALTER TABLE time_slots ADD COLUMN is_full_day TINYINT(1) DEFAULT 0 AFTER capacity`);
    await conn.query("UPDATE time_slots SET is_full_day = 1 WHERE name = 'Full Day'");
    console.log('✅ Added is_full_day to time_slots');
  }

  // Add closing_notified to checkins
  const [cols4] = await conn.query("SHOW COLUMNS FROM checkins LIKE 'closing_notified'");
  if (!cols4.length) {
    await conn.query(`ALTER TABLE checkins ADD COLUMN closing_notified TINYINT(1) DEFAULT 0`);
    console.log('✅ Added closing_notified to checkins');
  }

  console.log('\n🎉 Migration complete');
  await conn.end();
}

migrate().catch(e => { console.error('❌', e.message); process.exit(1); });
