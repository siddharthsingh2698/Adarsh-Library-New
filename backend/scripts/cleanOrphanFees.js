require('dotenv').config();
const mysql = require('mysql2/promise');

async function clean() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'adarsh_library',
  });

  const [r] = await conn.query(
    "UPDATE fees SET status = 'waived', deleted_at = NOW() WHERE status IN ('pending','overdue') AND student_id IN (SELECT id FROM students WHERE status = 'inactive' OR deleted_at IS NOT NULL)"
  );
  console.log('Cleaned', r.affectedRows, 'orphaned fee records');
  await conn.end();
}

clean().catch(e => { console.error(e.message); process.exit(1); });
