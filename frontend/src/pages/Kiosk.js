import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';
const COOKIE_NAME = 'alms_kiosk_token';
const COOKIE_DAYS = 30;

// ── Cookie helpers ────────────────────────────────────────────────────
function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}
function getCookie(name) {
  return document.cookie.split('; ').reduce((acc, c) => {
    const [k, v] = c.split('=');
    return k === name ? decodeURIComponent(v) : acc;
  }, null);
}
function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}

export default function Kiosk() {
  const [authed, setAuthed]     = useState(false);
  const [pin, setPin]           = useState('');
  const [pinError, setPinError] = useState('');
  const [pinLoading, setPinLoading] = useState(false);

  const [status, setStatus]     = useState('idle');
  const [result, setResult]     = useState(null);
  const [phone, setPhone]       = useState('');

  // Check cookie on mount
  useEffect(() => {
    const token = getCookie(COOKIE_NAME);
    if (token) {
      axios.defaults.headers.common['X-Kiosk-Token'] = token;
      setAuthed(true);
    }
  }, []);

  // Auto-reset after 5 seconds
  useEffect(() => {
    if (status === 'success' || status === 'error' || status === 'checkout') {
      const t = setTimeout(() => { setStatus('idle'); setResult(null); }, 5000);
      return () => clearTimeout(t);
    }
  }, [status]);

  const handlePinLogin = async (e) => {
    e.preventDefault();
    setPinError(''); setPinLoading(true);
    try {
      const { data } = await axios.post(`${API}/auth/kiosk-login`, { pin });
      setCookie(COOKIE_NAME, data.token, COOKIE_DAYS);
      axios.defaults.headers.common['X-Kiosk-Token'] = data.token;
      setAuthed(true);
    } catch (err) {
      setPinError(err.response?.data?.message || 'Incorrect PIN');
    } finally { setPinLoading(false); }
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setStatus('processing');
    try {
      const { data } = await axios.post(`${API}/checkins/qr`, { qr_code: phone.trim() });
      setResult(data);
      setStatus(data.action === 'checkout' ? 'checkout' : 'success');
    } catch (err) {
      setResult({ message: err.response?.data?.message || 'Not found' });
      setStatus('error');
    }
    setPhone('');
  };

  const handleLogout = () => {
    deleteCookie(COOKIE_NAME);
    delete axios.defaults.headers.common['X-Kiosk-Token'];
    setAuthed(false);
    setPin('');
  };

  // ── PIN screen ────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: '#f4f3fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ background: 'white', border: '1px solid #e3e1e9', borderRadius: 8, padding: 48, width: '100%', maxWidth: 360, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, background: '#00236f', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <span className="material-symbols-outlined" style={{ color: 'white', fontSize: 32 }}>lock</span>
          </div>
          <h2 style={{ fontFamily: 'Newsreader, serif', fontSize: 24, fontWeight: 700, color: '#00236f', marginBottom: 6 }}>Kiosk Access</h2>
          <p style={{ color: '#757682', fontSize: 13, marginBottom: 28 }}>Enter the kiosk PIN to continue</p>

          <form onSubmit={handlePinLogin}>
            <input
              type="password"
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="Enter PIN"
              autoFocus
              maxLength={8}
              style={{
                width: '100%', padding: '14px', border: '2px solid #e3e1e9', borderRadius: 6,
                fontSize: 24, textAlign: 'center', letterSpacing: '0.3em', outline: 'none',
                fontFamily: 'monospace', boxSizing: 'border-box', marginBottom: 12
              }}
              onFocus={e => e.target.style.borderColor = '#00236f'}
              onBlur={e => e.target.style.borderColor = '#e3e1e9'}
            />
            {pinError && (
              <div style={{ background: '#ffdad6', color: '#93000a', padding: '8px 12px', borderRadius: 4, fontSize: 13, marginBottom: 12 }}>
                {pinError}
              </div>
            )}
            <button type="submit" disabled={pinLoading} style={{ width: '100%', padding: '12px', background: '#00236f', color: 'white', border: 'none', borderRadius: 6, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Newsreader, serif' }}>
              {pinLoading ? 'Verifying...' : 'Unlock Kiosk'}
            </button>
          </form>

          <p style={{ marginTop: 20, fontSize: 11, color: '#c5c5d3' }}>
            <a href="/login" style={{ color: '#00236f' }}>Admin login</a>
          </p>
        </div>
      </div>
    );
  }

  // ── Kiosk screen ─────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#f4f3fa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ width: 64, height: 64, background: '#00236f', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <span className="material-symbols-outlined" style={{ color: 'white', fontSize: 32 }}>account_balance</span>
        </div>
        <h1 style={{ fontFamily: 'Newsreader, serif', fontSize: 32, fontWeight: 700, color: '#00236f', margin: 0 }}>
          Adarsh Library
        </h1>
        <p style={{ color: '#757682', fontSize: 14, marginTop: 6 }}>Student Check-In / Check-Out</p>
      </div>

      {/* Success */}
      {status === 'success' && (
        <div style={{ background: '#adedd3', border: '2px solid #2b6954', borderRadius: 8, padding: 32, textAlign: 'center', marginBottom: 32, width: '100%', maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#2b6954', fontFamily: 'Newsreader, serif' }}>
            Welcome, {result?.student_name}!
          </div>
          {result?.seat_number && (
            <div style={{ fontSize: 16, color: '#306d58', marginTop: 8 }}>
              Seat <strong>{result.seat_number}</strong> · {result.slot_name}
            </div>
          )}
          {result?.flagged && (
            <div style={{ fontSize: 12, color: '#773205', marginTop: 8, background: '#ffdbcb', padding: '4px 12px', borderRadius: 20, display: 'inline-block' }}>
              ⚠️ Outside your slot time
            </div>
          )}
          <div style={{ fontSize: 12, color: '#757682', marginTop: 12 }}>Resetting in 5 seconds...</div>
        </div>
      )}

      {/* Checkout */}
      {status === 'checkout' && (
        <div style={{ background: '#dce1ff', border: '2px solid #00236f', borderRadius: 8, padding: 32, textAlign: 'center', marginBottom: 32, width: '100%', maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>👋</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#00236f', fontFamily: 'Newsreader, serif' }}>
            Goodbye, {result?.student_name}!
          </div>
          {result?.duration && (
            <div style={{ fontSize: 16, color: '#264191', marginTop: 8 }}>
              Session: <strong>{result.duration}</strong>
            </div>
          )}
          <div style={{ fontSize: 12, color: '#757682', marginTop: 12 }}>Resetting in 5 seconds...</div>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div style={{ background: '#ffdad6', border: '2px solid #ba1a1a', borderRadius: 8, padding: 32, textAlign: 'center', marginBottom: 32, width: '100%', maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>❌</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#ba1a1a' }}>{result?.message}</div>
          <div style={{ fontSize: 12, color: '#757682', marginTop: 12 }}>Resetting in 5 seconds...</div>
        </div>
      )}

      {/* Processing */}
      {status === 'processing' && (
        <div style={{ textAlign: 'center', color: '#757682', fontSize: 16, marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>⏳</div>
          Processing...
        </div>
      )}

      {/* Phone entry */}
      {status === 'idle' && (
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ background: 'white', border: '1px solid #e3e1e9', borderRadius: 8, padding: 32 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#757682', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 20, textAlign: 'center' }}>
              Enter Your Phone Number
            </div>
            <form onSubmit={handleCheckIn} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                autoFocus
                type="tel"
                style={{
                  width: '100%', padding: '16px',
                  border: '2px solid #e3e1e9', borderRadius: 6,
                  fontSize: 22, textAlign: 'center', letterSpacing: '0.1em',
                  fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.borderColor = '#00236f'}
                onBlur={e => e.target.style.borderColor = '#e3e1e9'}
              />
              <button type="submit" style={{ width: '100%', padding: '14px', background: '#00236f', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 16, fontFamily: 'Newsreader, serif' }}>
                Check In / Check Out
              </button>
            </form>
            <p style={{ fontSize: 11, color: '#c5c5d3', marginTop: 16, textAlign: 'center' }}>
              Enter the phone number registered with your library account
            </p>
          </div>
        </div>
      )}

      {/* Logout kiosk */}
      <button onClick={handleLogout} style={{ marginTop: 32, background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#c5c5d3' }}>
        Lock Kiosk
      </button>
    </div>
  );
}
