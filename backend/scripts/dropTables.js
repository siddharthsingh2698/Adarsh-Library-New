require('dotenv').config();
const mysql = require('mysql2/promise');

async function drop() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'adarsh_library',
  });

  await conn.query('SET FOREIGN_KEY_CHECKS=0');

  const tables = [
    'notifications', 'checkins', 'fees',
    'locker_allotments', 'lockers',
    'seat_allotments', 'students', 'seats',
    'time_slots', 'library_config', 'admins',
    // old schema tables
    'subscriptions', 'plans', 'shifts',
  ];

  for (const t of tables) {
    await conn.query(`DROP TABLE IF EXISTS \`${t}\``);
    console.log(`Dropped ${t}`);
  }

  await conn.query('SET FOREIGN_KEY_CHECKS=1');
  await conn.end();
  console.log('All tables dropped. Run npm run init-db next.');
}

drop().catch(e => { console.error(e.message); process.exit(1); });
