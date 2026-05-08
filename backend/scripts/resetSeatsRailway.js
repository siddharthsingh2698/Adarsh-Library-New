// Run this against Railway DB to reset seats to 1-96
// Usage: railway run node scripts/resetSeatsRailway.js
require('dotenv').config();
const mysql = require('mysql2/promise');

async function reset() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST,
    port:     parseInt(process.env.DB_PORT || '3306'),
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  await conn.query('SET FOREIGN_KEY_CHECKS=0');
  await conn.query('DELETE FROM seat_allotments');
  await conn.query('DELETE FROM seats');
  await conn.query('SET FOREIGN_KEY_CHECKS=1');
  console.log('Cleared seats and allotments');

  // Add has_locker column if missing
  const [cols] = await conn.query("SHOW COLUMNS FROM seats LIKE 'has_locker'");
  if (!cols.length) {
    await conn.query('ALTER TABLE seats ADD COLUMN has_locker TINYINT(1) DEFAULT 0');
    console.log('Added has_locker column');
  }

  for (let i = 1; i <= 96; i++) {
    const row = Math.ceil(i / 12);
    const col = ((i - 1) % 12) + 1;
    const zone = i <= 48 ? 'Zone A' : 'Zone B';
    const hasLocker = (i >= 9 && i <= 27) ? 1 : 0;
    const hasPower = i % 4 === 0 ? 1 : 0;
    const [[{ uuid }]] = await conn.query('SELECT UUID() AS uuid');
    await conn.query(
      'INSERT INTO seats (id, seat_number, row_num, col_num, zone, has_power, has_locker) VALUES (?,?,?,?,?,?,?)',
      [uuid, String(i), row, col, zone, hasPower, hasLocker]
    );
  }

  console.log('✅ 96 seats created (1-96)');
  console.log('   Locker seats: 9-27');
  await conn.end();
}

reset().catch(e => { console.error(e.message); process.exit(1); });
