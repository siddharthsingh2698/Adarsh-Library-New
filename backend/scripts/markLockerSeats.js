require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'adarsh_library',
  });

  // 1. Add has_locker column if it doesn't exist
  await conn.query(`
    ALTER TABLE seats
    ADD COLUMN IF NOT EXISTS has_locker TINYINT(1) DEFAULT 0
  `).catch(() => {
    // column may already exist, ignore
  });

  // Fallback for older MySQL that doesn't support IF NOT EXISTS on ALTER
  const [cols] = await conn.query(`SHOW COLUMNS FROM seats LIKE 'has_locker'`);
  if (!cols.length) {
    await conn.query(`ALTER TABLE seats ADD COLUMN has_locker TINYINT(1) DEFAULT 0`);
  }

  // 2. Mark seats 9–27 as locker seats
  const [r] = await conn.query(
    `UPDATE seats SET has_locker = 1 WHERE CAST(seat_number AS UNSIGNED) BETWEEN 9 AND 27`
  );
  console.log(`✅ Marked ${r.affectedRows} seats (9–27) as locker seats`);

  // 3. Verify
  const [rows] = await conn.query(
    `SELECT seat_number, has_locker FROM seats ORDER BY CAST(seat_number AS UNSIGNED)`
  );
  const lockerSeats = rows.filter(r => r.has_locker).map(r => r.seat_number);
  console.log(`Locker seats: ${lockerSeats.join(', ')}`);

  await conn.end();
}

run().catch(e => { console.error(e.message); process.exit(1); });
