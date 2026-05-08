import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [tab, setTab]       = useState('admin'); // 'admin' | 'student'
  const [email, setEmail]   = useState('');
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await axios.post(`${API}/auth/student-login`, {
        student_login_id: studentId.trim().toLowerCase()
      });
      localStorage.setItem('alms_student_token', data.token);
      localStorage.setItem('alms_student', JSON.stringify(data.student));
      navigate('/student-portal');
    } catch (err) {
      setError(err.response?.data?.message || 'Student ID not found');
    } finally { setLoading(false); }
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', border: '1px solid #e3e1e9',
    borderRadius: 4, fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif',
    boxSizing: 'border-box'
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f3fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', border: '1px solid #e3e1e9', borderRadius: 4, padding: 48, width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, background: '#00236f', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <span className="material-symbols-outlined" style={{ color: 'white', fontSize: 28 }}>account_balance</span>
          </div>
          <h1 style={{ fontFamily: 'Newsreader, serif', fontSize: 26, fontWeight: 700, color: '#00236f', margin: 0 }}>
            Adarsh Library
          </h1>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', border: '1px solid #e3e1e9', borderRadius: 4, marginBottom: 28, overflow: 'hidden' }}>
          {[['admin', 'Admin Login'], ['student', 'Student Login']].map(([key, label]) => (
            <button key={key} onClick={() => { setTab(key); setError(''); }} style={{
              flex: 1, padding: '10px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
              background: tab === key ? '#00236f' : 'white',
              color: tab === key ? 'white' : '#757682',
              transition: 'all 0.15s'
            }}>{label}</button>
          ))}
        </div>

        {/* Admin form */}
        {tab === 'admin' && (
          <form onSubmit={handleAdminLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#757682', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@adarsh.library" required style={inputStyle} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#757682', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={inputStyle} />
            </div>
            {error && <div style={{ background: '#ffdad6', color: '#93000a', padding: '10px 14px', borderRadius: 4, fontSize: 13, marginBottom: 16 }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: loading ? '#757682' : '#00236f', color: 'white', border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Newsreader, serif' }}>
              {loading ? 'Signing in...' : 'Sign In as Admin'}
            </button>
          </form>
        )}

        {/* Student form */}
        {tab === 'student' && (
          <form onSubmit={handleStudentLogin}>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#757682', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Student ID</label>
              <input
                type="text"
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
                placeholder="alms@firstname_1234"
                required
                style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 15 }}
              />
              <p style={{ fontSize: 11, color: '#757682', marginTop: 6 }}>
                Your ID is printed on your library card (e.g. alms@siddharth_1001)
              </p>
            </div>
            {error && <div style={{ background: '#ffdad6', color: '#93000a', padding: '10px 14px', borderRadius: 4, fontSize: 13, marginBottom: 16 }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: loading ? '#757682' : '#2b6954', color: 'white', border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Newsreader, serif' }}>
              {loading ? 'Signing in...' : 'Sign In as Student'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
