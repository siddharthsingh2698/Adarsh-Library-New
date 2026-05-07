require('dotenv').config();
const mysql = require('mysql2/promise');

async function resetSeats() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'adarsh_library',
  });

  // Remove existing allotments and seats
  await conn.query('SET FOREIGN_KEY_CHECKS=0');
  await conn.query('DELETE FROM seat_allotments');
  await conn.query('DELETE FROM seats');
  await conn.query('SET FOREIGN_KEY_CHECKS=1');
  console.log('Cleared existing seats and allotments');

  // Insert 96 seats numbered 1–96
  // Layout: 8 rows × 12 cols
  // Zone A = seats 1–48, Zone B = seats 49–96
  for (let i = 1; i <= 96; i++) {
    const row = Math.ceil(i / 12);
    const col = ((i - 1) % 12) + 1;
    const zone = i <= 48 ? 'Zone A' : 'Zone B';
    const [[{ uuid }]] = await conn.query('SELECT UUID() AS uuid');
    await conn.query(
      'INSERT INTO seats (id, seat_number, row_num, col_num, zone, has_power) VALUES (?,?,?,?,?,?)',
      [uuid, String(i), row, col, zone, i % 4 === 0 ? 1 : 0]
    );
  }

  console.log('✅ 96 seats created (1–96)');
  console.log('   Zone A: seats 1–48');
  console.log('   Zone B: seats 49–96');
  await conn.end();
}

resetSeats().catch(e => { console.error(e.message); process.exit(1); });
