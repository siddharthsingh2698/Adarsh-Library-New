import React, { useEffect, useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';
const KIOSK_URL = `${window.location.origin}/kiosk`;

export default function LibraryPage() {
  const [config, setConfig] = useState({ library_name: 'Adarsh Library' });
  const [time, setTime]     = useState(new Date());
  const [uid, setUid]       = useState('');
  const [result, setResult] = useState(null); // { type: 'success'|'error', message, name }
  const qrRef = useRef();

  useEffect(() => {
    axios.get(`${API}/config`).then(r => { if (r.data.data?.library_name) setConfig(r.data.data); }).catch(() => {});
    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  // Auto-clear result after 5s
  useEffect(() => {
    if (!result) return;
    const t = setTimeout(() => setResult(null), 5000);
    return () => clearTimeout(t);
  }, [result]);

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!uid.trim()) return;
    try {
      const { data } = await axios.post(`${API}/checkins/qr`, { qr_code: uid.trim() });
      if (data.action === 'checkout') {
        setResult({ type: 'checkout', message: `Goodbye, ${data.student_name}!`, sub: `Duration: ${data.duration}` });
      } else {
        setResult({ type: 'success', message: `Welcome, ${data.student_name}!`, sub: data.seat_number ? `Seat ${data.seat_number} · ${data.slot_name || ''}` : '' });
      }
      setUid('');
    } catch (err) {
      setResult({ type: 'error', message: err.response?.data?.message || 'Check-in failed' });
    }
  };

  const handlePrintQR = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;
    const img = canvas.toDataURL('image/png');
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Check-In QR</title>
      <style>
        body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f4f3fa;font-family:Georgia,serif;}
        .card{background:white;border:2px solid #00236f;border-radius:16px;padding:40px;text-align:center;max-width:340px;}
        h1{font-size:22px;font-weight:900;color:#00236f;margin:0 0 4px;text-transform:uppercase;}
        p{font-size:11px;color:#757682;margin:0 0 24px;text-transform:uppercase;letter-spacing:0.1em;}
        img{display:block;margin:0 auto 16px;}
        .url{font-size:10px;color:#c5c5d3;font-family:monospace;word-break:break-all;}
        @media print{body{background:white;}}
      </style></head><body>
      <div class="card">
        <h1>${config.library_name}</h1>
        <p>Scan to Check In</p>
        <img src="${img}" width="220" height="220"/>
        <div class="url">${KIOSK_URL}</div>
      </div>
      <script>window.onload=()=>window.print()<\/script>
      </body></html>
    `);
    win.document.close();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f3fa', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <div style={{ background: '#00236f', color: 'white', padding: '14px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>account_balance</span>
          <span style={{ fontFamily: 'Newsreader, serif', fontWeight: 900, fontSize: 17, textTransform: 'uppercase', letterSpacing: '-0.01em' }}>
            {config.library_name}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13 }}>
          <span style={{ opacity: 0.7 }}>
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <a href="/login" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textDecoration: 'none' }}>Admin</a>
        </div>
      </div>

      {/* Main — centered */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>

          {/* Title */}
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'Newsreader, serif', fontSize: 36, fontWeight: 700, color: '#00236f', margin: '0 0 6px' }}>
              Student Check-In
            </h1>
            <p style={{ color: '#757682', fontSize: 14, margin: 0 }}>
              Scan the QR code or enter your student ID
            </p>
          </div>

          {/* QR Card */}
          <div style={{ background: 'white', border: '2px solid #00236f', borderRadius: 12, padding: 32, textAlign: 'center', width: '100%', boxShadow: '0 8px 32px rgba(0,35,111,0.10)' }}>
            <div ref={qrRef} style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <QRCodeCanvas
                value={KIOSK_URL}
                size={220}
                level="M"
                includeMargin={true}
                bgColor="#ffffff"
                fgColor="#00236f"
              />
            </div>
            <div style={{ fontSize: 11, color: '#c5c5d3', fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: 20 }}>
              {KIOSK_URL}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <a href="/kiosk" target="_blank" rel="noreferrer" style={{ flex: 1, padding: '10px', background: '#00236f', color: 'white', borderRadius: 6, textDecoration: 'none', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>open_in_new</span>
                Open Kiosk
              </a>
              <button onClick={handlePrintQR} style={{ flex: 1, padding: '10px', background: 'none', border: '1px solid #00236f', color: '#00236f', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>print</span>
                Print QR
              </button>
            </div>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
            <div style={{ flex: 1, height: 1, background: '#e3e1e9' }} />
            <span style={{ fontSize: 12, color: '#757682', fontWeight: 600 }}>OR ENTER UID</span>
            <div style={{ flex: 1, height: 1, background: '#e3e1e9' }} />
          </div>

          {/* UID entry */}
          <form onSubmit={handleCheckIn} style={{ width: '100%', display: 'flex', gap: 8 }}>
            <input
              value={uid}
              onChange={e => setUid(e.target.value)}
              placeholder="Enter your Student ID (ALMS-...)"
              style={{ flex: 1, padding: '12px 14px', border: '1px solid #e3e1e9', borderRadius: 6, fontSize: 13, outline: 'none', fontFamily: 'monospace' }}
            />
            <button type="submit" style={{ padding: '12px 20px', background: '#00236f', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap' }}>
              Check In
            </button>
          </form>

          {/* Result feedback */}
          {result && (
            <div style={{
              width: '100%', padding: '16px 20px', borderRadius: 8, textAlign: 'center',
              background: result.type === 'checkout' ? '#dce1ff' : result.type === 'success' ? '#adedd3' : '#ffdad6',
              border: `2px solid ${result.type === 'checkout' ? '#00236f' : result.type === 'success' ? '#2b6954' : '#ba1a1a'}`,
            }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>
                {result.type === 'checkout' ? '👋' : result.type === 'success' ? '✅' : '❌'}
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, color: result.type === 'checkout' ? '#00236f' : result.type === 'success' ? '#2b6954' : '#ba1a1a', fontFamily: 'Newsreader, serif' }}>
                {result.message}
              </div>
              {result.sub && <div style={{ fontSize: 13, color: '#444651', marginTop: 4 }}>{result.sub}</div>}
              <div style={{ fontSize: 11, color: '#757682', marginTop: 8 }}>Resetting in 5 seconds...</div>
            </div>
          )}

          {/* Copy link */}
          <div style={{ width: '100%', background: 'white', border: '1px solid #e3e1e9', borderRadius: 8, padding: '12px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#757682', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Share Kiosk Link</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input readOnly value={KIOSK_URL} style={{ flex: 1, padding: '7px 10px', border: '1px solid #e3e1e9', borderRadius: 4, fontSize: 11, fontFamily: 'monospace', color: '#444651', outline: 'none', background: '#f4f3fa' }} />
              <button onClick={() => { navigator.clipboard.writeText(KIOSK_URL); alert('Copied!'); }} style={{ padding: '7px 14px', background: '#00236f', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                Copy
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
