import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

export default function AddStudent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', joined_at: new Date().toISOString().slice(0, 10), notification_channel: 'email' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post(`${API}/students`, form);
      navigate('/students');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add student');
    } finally { setLoading(false); }
  };

  const field = (label, key, type = 'text', required = false) => (
    <div>
      <label style={{ fontSize: 11, fontWeight: 700, color: '#757682', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
        {label}{required ? ' *' : ''}
      </label>
      <input type={type} value={form[key]} onChange={set(key)} required={required} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e3e1e9', borderRadius: 4, fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif' }} />
    </div>
  );

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 32 }}>
        <button onClick={() => navigate('/students')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#757682', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
          Back to Directory
        </button>
        <h2 style={{ fontFamily: 'Newsreader, serif', fontSize: 32, fontWeight: 600, color: '#00236f' }}>Register Student</h2>
        <p style={{ color: '#444651', fontSize: 14, marginTop: 4 }}>Add a new student to the library system.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ background: 'white', border: '1px solid #e3e1e9', borderRadius: 4, padding: 32 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {field('Full Name', 'name', 'text', true)}
            {field('Phone Number', 'phone', 'tel', true)}
            {field('Email Address', 'email', 'email')}
            {field('Join Date', 'joined_at', 'date', true)}
          </div>
          <div style={{ marginTop: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#757682', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Address</label>
            <textarea value={form.address} onChange={set('address')} rows={3} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e3e1e9', borderRadius: 4, fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif' }} />
          </div>
          <div style={{ marginTop: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#757682', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Notification Channel</label>
            <select value={form.notification_channel} onChange={set('notification_channel')} style={{ padding: '10px 12px', border: '1px solid #e3e1e9', borderRadius: 4, fontSize: 14, outline: 'none' }}>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>

        {error && <div style={{ background: '#ffdad6', color: '#93000a', padding: '12px 16px', borderRadius: 4, fontSize: 13, marginTop: 16 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button type="button" onClick={() => navigate('/students')} style={{ padding: '12px 24px', border: '1px solid #e3e1e9', background: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
            Cancel
          </button>
          <button type="submit" disabled={loading} style={{ padding: '12px 32px', background: loading ? '#757682' : '#00236f', color: 'white', border: 'none', borderRadius: 4, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700 }}>
            {loading ? 'Registering...' : 'Register Student'}
          </button>
        </div>
      </form>
    </div>
  );
}
