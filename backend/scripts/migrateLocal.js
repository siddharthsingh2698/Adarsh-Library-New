// Run this once to add all new columns to local MySQL
require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host:     'localhost',
    user:     'root',
    password: 'Sidd@!2698',
    database: 'adarsh_library',
  });

  const migrations = [
    ["SHOW COLUMNS FROM students LIKE 'student_login_id'",
     "ALTER TABLE students ADD COLUMN student_login_id VARCHAR(50) UNIQUE NULL AFTER qr_code"],
    ["SHOW COLUMNS FROM seat_allotments LIKE 'plan_type'",
     "ALTER TABLE seat_allotments ADD COLUMN plan_type ENUM('morning','afternoon','evening','full_day') NULL AFTER slot_id"],
    ["SHOW COLUMNS FROM seat_allotments LIKE 'duration_months'",
     "ALTER TABLE seat_allotments ADD COLUMN duration_months TINYINT DEFAULT 1 AFTER plan_type"],
    ["SHOW COLUMNS FROM time_slots LIKE 'is_full_day'",
     "ALTER TABLE time_slots ADD COLUMN is_full_day TINYINT(1) DEFAULT 0 AFTER capacity"],
    ["SHOW COLUMNS FROM checkins LIKE 'overtime_notified'",
     "ALTER TABLE checkins ADD COLUMN overtime_notified TINYINT(1) DEFAULT 0"],
    ["SHOW COLUMNS FROM checkins LIKE 'closing_notified'",
     "ALTER TABLE checkins ADD COLUMN closing_notified TINYINT(1) DEFAULT 0"],
    ["SHOW COLUMNS FROM seats LIKE 'has_locker'",
     "ALTER TABLE seats ADD COLUMN has_locker TINYINT(1) DEFAULT 0"],
  ];

  for (const [check, alter] of migrations) {
    const [cols] = await conn.query(check);
    if (!cols.length) {
      await conn.query(alter);
      console.log('✅', alter.split('ADD COLUMN')[1]?.trim().split(' ')[0]);
    }
  }

  // Mark Full Day slot
  await conn.query("UPDATE time_slots SET is_full_day = 1 WHERE name = 'Full Day'");

  // Mark locker seats 9-27
  await conn.query("UPDATE seats SET has_locker = 1 WHERE CAST(seat_number AS UNSIGNED) BETWEEN 9 AND 27");

  // Generate login IDs for existing students
  const [students] = await conn.query('SELECT id, name FROM students WHERE student_login_id IS NULL AND deleted_at IS NULL');
  for (const s of students) {
    const firstName = s.name.trim().split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const [existing] = await conn.query("SELECT student_login_id FROM students WHERE student_login_id LIKE ?", [`alms@${firstName}_%`]);
    const usedNums = existing.map(r => parseInt(r.student_login_id?.split('_').pop())).filter(n => !isNaN(n));
    const suffix = usedNums.length ? Math.max(...usedNums) + 1 : 1001;
    await conn.query('UPDATE students SET student_login_id = ? WHERE id = ?', [`alms@${firstName}_${suffix}`, s.id]);
    console.log(`  ${s.name} → alms@${firstName}_${suffix}`);
  }

  console.log('\n✅ Local DB fully migrated');
  await conn.end();
}

run().catch(e => { console.error('❌', e.message); process.exit(1); });
