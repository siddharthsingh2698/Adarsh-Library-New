require('dotenv').config();
const bcrypt = require('bcrypt');
const mysql  = require('mysql2/promise');

async function reset() {
  const conn = await mysql.createConnection({
    host:     'localhost',
    user:     'root',
    password: 'Sidd@!2698',
    database: 'adarsh_library',
  });

  const newPassword = 'admin123';
  const hash = await bcrypt.hash(newPassword, 10);

  const [r] = await conn.query(
    'UPDATE admins SET password_hash = ? WHERE email = ?',
    [hash, 'admin@adarsh.library']
  );

  if (r.affectedRows) {
    console.log('✅ Password reset successfully');
    console.log('Email:    admin@adarsh.library');
    console.log('Password: admin123');
  } else {
    // Show all admin emails in case it changed
    const [admins] = await conn.query('SELECT email FROM admins');
    console.log('No admin found with that email. Existing admins:');
    admins.forEach(a => console.log(' -', a.email));
  }

  await conn.end();
}

reset().catch(e => console.error(e.message));
