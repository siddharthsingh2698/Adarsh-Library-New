import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#f4f3fa',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: 'white', border: '1px solid #e3e1e9', borderRadius: 4,
        padding: 48, width: '100%', maxWidth: 400
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 56, height: 56, background: '#00236f', borderRadius: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
          }}>
            <span className="material-symbols-outlined" style={{ color: 'white', fontSize: 28 }}>account_balance</span>
          </div>
          <h1 style={{ fontFamily: 'Newsreader, serif', fontSize: 28, fontWeight: 700, color: '#00236f' }}>
            Adarsh Library
          </h1>
          <p style={{ fontSize: 12, color: '#757682', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Admin Portal
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#757682', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
              Email Address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="admin@adarsh.library"
              required
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid #e3e1e9',
                borderRadius: 4, fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif'
              }}
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#757682', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
              required
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid #e3e1e9',
                borderRadius: 4, fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif'
              }}
            />
          </div>

          {error && (
            <div style={{
              background: '#ffdad6', color: '#93000a', padding: '10px 14px',
              borderRadius: 4, fontSize: 13, marginBottom: 20
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '12px', background: loading ? '#757682' : '#00236f',
              color: 'white', border: 'none', borderRadius: 4, fontSize: 14,
              fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Newsreader, serif', letterSpacing: '0.02em'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#757682', marginTop: 24 }}>
          Default: admin@adarsh.library / admin123
        </p>
      </div>
    </div>
  );
}
