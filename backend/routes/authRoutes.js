const express = require('express');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const db      = require('../config/database');
const asyncHandler = require('../middleware/asyncHandler');
const auth    = require('../middleware/auth');

const router = express.Router();

// POST /api/v1/auth/login
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password are required' });

  const rows = await db.q('SELECT * FROM admins WHERE email = ?', [email]);
  if (!rows.length)
    return res.status(401).json({ success: false, message: 'Invalid credentials' });

  const admin = rows[0];
  const valid = await bcrypt.compare(password, admin.password_hash);
  if (!valid)
    return res.status(401).json({ success: false, message: 'Invalid credentials' });

  const token = jwt.sign(
    { adminId: admin.id, email: admin.email, name: admin.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  res.json({
    success: true,
    message: 'Login successful',
    token,
    admin: { id: admin.id, name: admin.name, email: admin.email }
  });
}));

// GET /api/v1/auth/me
router.get('/me', auth, asyncHandler(async (req, res) => {
  const rows = await db.q('SELECT id, name, email, created_at FROM admins WHERE id = ?', [req.admin.adminId]);
  if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: rows[0] });
}));

// PUT /api/v1/auth/password
router.put('/password', auth, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ success: false, message: 'Both passwords required' });

  const rows = await db.q('SELECT * FROM admins WHERE id = ?', [req.admin.adminId]);
  if (!rows.length) return res.status(404).json({ success: false, message: 'Admin not found' });

  const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
  if (!valid) return res.status(401).json({ success: false, message: 'Current password incorrect' });

  const hash = await bcrypt.hash(newPassword, 10);
  await db.q('UPDATE admins SET password_hash = ? WHERE id = ?', [hash, req.admin.adminId]);
  res.json({ success: true, message: 'Password updated' });
}));

// POST /api/v1/auth/kiosk-login — kiosk PIN auth
router.post('/kiosk-login', asyncHandler(async (req, res) => {
  const { pin } = req.body;
  const correctPin = process.env.KIOSK_PIN || '1234';
  if (!pin) return res.status(400).json({ success: false, message: 'PIN required' });
  if (pin !== correctPin) return res.status(401).json({ success: false, message: 'Incorrect PIN' });

  const token = jwt.sign(
    { role: 'kiosk' },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }  // long-lived so kiosk stays logged in
  );

  res.json({ success: true, token, message: 'Kiosk authenticated' });
}));

module.exports = router;
  const { student_login_id } = req.body;
  if (!student_login_id)
    return res.status(400).json({ success: false, message: 'Student ID required' });

  const rows = await db.q(
    'SELECT * FROM students WHERE student_login_id = ? AND status = ? AND deleted_at IS NULL',
    [student_login_id.trim().toLowerCase(), 'active']
  );
  if (!rows.length)
    return res.status(401).json({ success: false, message: 'Student ID not found or account inactive' });

  const student = rows[0];
  const token = jwt.sign(
    { studentId: student.id, name: student.name, role: 'student' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  res.json({
    success: true,
    message: 'Login successful',
    token,
    student: {
      id: student.id,
      name: student.name,
      phone: student.phone,
      student_login_id: student.student_login_id,
      role: 'student'
    }
  });
}));

module.exports = router;
