require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
  const isRailway = process.env.USE_RAILWAY === 'true';
  const conn = await mysql.createConnection({
    host:     isRailway ? 'switchyard.proxy.rlwy.net' : (process.env.DB_HOST || 'localhost'),
    port:     isRailway ? 26189 : parseInt(process.env.DB_PORT || '3306'),
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'adarsh_library',
    ssl: isRailway ? { rejectUnauthorized: false } : false,
  });

  // Add student_login_id column
  const [cols] = await conn.query("SHOW COLUMNS FROM students LIKE 'student_login_id'");
  if (!cols.length) {
    await conn.query('ALTER TABLE students ADD COLUMN student_login_id VARCHAR(50) UNIQUE NULL AFTER qr_code');
    console.log('✅ Added student_login_id column');
  }

  // Generate login IDs for existing students
  const [students] = await conn.query('SELECT id, name FROM students WHERE student_login_id IS NULL AND deleted_at IS NULL');
  for (const s of students) {
    const firstName = s.name.trim().split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const [existing] = await conn.query(
      "SELECT student_login_id FROM students WHERE student_login_id LIKE ?",
      [`alms@${firstName}_%`]
    );
    const usedNums = existing.map(r => parseInt(r.student_login_id?.split('_').pop())).filter(n => !isNaN(n));
    const suffix = usedNums.length ? Math.max(...usedNums) + 1 : 1001;
    const loginId = `alms@${firstName}_${suffix}`;
    await conn.query('UPDATE students SET student_login_id = ? WHERE id = ?', [loginId, s.id]);
    console.log(`  ${s.name} → ${loginId}`);
  }

  console.log('✅ All students have login IDs');
  await conn.end();
}

run().catch(e => { console.error(e.message); process.exit(1); });
