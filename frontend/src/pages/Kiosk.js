import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

export default function Kiosk() {
  const [status, setStatus]     = useState('idle');
  const [result, setResult]     = useState(null);
  const [uid, setUid]           = useState('');

  // Auto-reset after 5 seconds
  useEffect(() => {
    if (status === 'success' || status === 'error' || status === 'checkout') {
      const t = setTimeout(() => { setStatus('idle'); setResult(null); }, 5000);
      return () => clearTimeout(t);
    }
  }, [status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!uid.trim()) return;
    setStatus('processing');
    try {
      const { data } = await axios.post(`${API}/checkins/qr`, { qr_code: uid.trim() });
      setResult(data);
      setStatus(data.action === 'checkout' ? 'checkout' : 'success');
    } catch (err) {
      setResult({ message: err.response?.data?.message || 'Check-in failed' });
      setStatus('error');
    }
    setUid('');
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#f4f3fa',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: 'Inter, sans-serif'
    }}>
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

      {/* ID Entry */}
      {status === 'idle' && (
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ background: 'white', border: '1px solid #e3e1e9', borderRadius: 8, padding: 32 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#757682', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 20, textAlign: 'center' }}>
              Enter Your Student ID
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                value={uid}
                onChange={e => setUid(e.target.value)}
                placeholder="ALMS-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                autoFocus
                style={{
                  width: '100%', padding: '14px 16px',
                  border: '2px solid #e3e1e9', borderRadius: 6,
                  fontSize: 13, fontFamily: 'monospace', outline: 'none',
                  textAlign: 'center', letterSpacing: '0.02em',
                  boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.borderColor = '#00236f'}
                onBlur={e => e.target.style.borderColor = '#e3e1e9'}
              />
              <button
                type="submit"
                style={{
                  width: '100%', padding: '14px',
                  background: '#00236f', color: 'white',
                  border: 'none', borderRadius: 6,
                  cursor: 'pointer', fontWeight: 700, fontSize: 16,
                  fontFamily: 'Newsreader, serif'
                }}
              >
                Check In / Check Out
              </button>
            </form>
            <p style={{ fontSize: 11, color: '#c5c5d3', marginTop: 16, textAlign: 'center' }}>
              Your ID is printed on your library card
            </p>
          </div>
        </div>
      )}

      <p style={{ marginTop: 32, fontSize: 11, color: '#c5c5d3' }}>
        Admin portal: <a href="/login" style={{ color: '#00236f' }}>Sign in</a>
      </p>
    </div>
  );
}
