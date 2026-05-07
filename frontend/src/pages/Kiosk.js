import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

export default function Kiosk() {
  const [status, setStatus]     = useState('idle');
  const [result, setResult]     = useState(null);
  const [manualId, setManualId] = useState('');
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const didStart   = useRef(false);

  // Auto-reset after 5 seconds on success/error
  useEffect(() => {
    if (status === 'success' || status === 'error' || status === 'checkout') {
      const t = setTimeout(() => { setStatus('idle'); setResult(null); }, 5000);
      return () => clearTimeout(t);
    }
  }, [status]);

  // Start scanner AFTER the div#qr-reader is in the DOM
  useEffect(() => {
    if (!scanning || didStart.current) return;
    if (!window.Html5Qrcode) {
      setScanning(false);
      alert('QR scanner not loaded. Use manual entry.');
      return;
    }

    didStart.current = true;
    const scanner = new window.Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        scanner.stop().catch(() => {});
        scannerRef.current = null;
        didStart.current = false;
        setScanning(false);
        handleQrResult(decodedText);
      },
      () => {}
    ).catch(() => {
      didStart.current = false;
      setScanning(false);
      alert('Camera not available. Use manual entry below.');
    });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
      didStart.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning]);

  const handleQrResult = async (qrCode) => {
    setStatus('processing');
    try {
      const { data } = await axios.post(`${API}/checkins/qr`, { qr_code: qrCode });
      setResult(data);
      setStatus(data.action === 'checkout' ? 'checkout' : 'success');
    } catch (err) {
      setResult({ message: err.response?.data?.message || 'Check-in failed' });
      setStatus('error');
    }
  };

  const stopCamera = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    didStart.current = false;
    setScanning(false);
  };

  const handleManual = (e) => {
    e.preventDefault();
    if (!manualId.trim()) return;
    handleQrResult(manualId.trim());
    setManualId('');
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
        <p style={{ color: '#757682', fontSize: 14, marginTop: 6 }}>Student Check-In Kiosk</p>
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

      {/* Idle — show scanner + manual entry */}
      {status === 'idle' && (
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Camera scanner */}
          <div style={{ background: 'white', border: '1px solid #e3e1e9', borderRadius: 8, padding: 24, marginBottom: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#757682', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
              Scan QR Code
            </div>

            {/* qr-reader div always rendered when scanning=true so html5-qrcode can find it */}
            {scanning && (
              <div>
                <div id="qr-reader" style={{ width: '100%', borderRadius: 4, overflow: 'hidden' }} />
                <button
                  onClick={stopCamera}
                  style={{ marginTop: 12, padding: '8px 20px', background: 'none', border: '1px solid #e3e1e9', borderRadius: 4, cursor: 'pointer', fontSize: 13, color: '#757682' }}
                >
                  Cancel
                </button>
              </div>
            )}

            {!scanning && (
              <button
                onClick={() => { didStart.current = false; setScanning(true); }}
                style={{
                  width: '100%', padding: '16px', background: '#00236f', color: 'white',
                  border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 16, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 24 }}>qr_code_scanner</span>
                Open Camera &amp; Scan
              </button>
            )}
          </div>

          {/* Manual entry */}
          <div style={{ background: 'white', border: '1px solid #e3e1e9', borderRadius: 8, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#757682', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Or Enter Student ID Manually
            </div>
            <form onSubmit={handleManual} style={{ display: 'flex', gap: 8 }}>
              <input
                value={manualId}
                onChange={e => setManualId(e.target.value)}
                placeholder="ALMS-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                style={{ flex: 1, padding: '10px 12px', border: '1px solid #e3e1e9', borderRadius: 4, fontSize: 12, outline: 'none', fontFamily: 'monospace' }}
              />
              <button
                type="submit"
                style={{ padding: '10px 16px', background: '#00236f', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}
              >
                Check In
              </button>
            </form>
            <p style={{ fontSize: 11, color: '#c5c5d3', marginTop: 8 }}>
              Find your full ID on your printed library card
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
