require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'adarsh_library',
  });

  const [r] = await conn.query("DELETE FROM time_slots WHERE name = 'Night'");
  console.log(`Deleted ${r.affectedRows} slot(s)`);

  const slots = await conn.query('SELECT name, start_time, end_time FROM time_slots ORDER BY start_time');
  console.log('Remaining slots:');
  slots[0].forEach(s => console.log(` - ${s.name}: ${s.start_time} – ${s.end_time}`));

  await conn.end();
}

run().catch(e => { console.error(e.message); process.exit(1); });
