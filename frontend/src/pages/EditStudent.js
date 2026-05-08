import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

export default function EditStudent() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [student, setStudent] = useState(null);
  const [form, setForm]       = useState(null);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const printRef = useRef();

  useEffect(() => {
    axios.get(`${API}/students/${id}`).then(r => {
      const s = r.data.data;
      setStudent(s);
      setForm({
        name: s.name, phone: s.phone, email: s.email || '',
        address: s.address || '', joined_at: s.joined_at?.slice(0, 10),
        status: s.status, notification_channel: s.notification_channel || 'email'
      });
    }).catch(() => navigate('/students'));
  }, [id, navigate]);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`${API}/students/${id}`, form);
      navigate('/students');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  const handlePrint = () => {
    const canvas = printRef.current?.querySelector('canvas');
    if (!canvas) return;
    const img = canvas.toDataURL('image/png');
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>ID Card — ${student.name}</title>
      <style>
        body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f4f3fa; font-family: Inter, sans-serif; }
        .card { background: white; border: 2px solid #00236f; border-radius: 12px; padding: 28px 32px; width: 320px; text-align: center; box-shadow: 0 4px 24px rgba(0,35,111,0.12); }
        .logo { font-size: 22px; font-weight: 900; color: #00236f; letter-spacing: -0.02em; margin-bottom: 2px; }
        .sub  { font-size: 9px; color: #757682; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 20px; }
        .name { font-size: 20px; font-weight: 700; color: #1a1b21; margin-bottom: 4px; }
        .phone{ font-size: 13px; color: #757682; margin-bottom: 4px; }
        .seat { font-size: 12px; color: #00236f; font-weight: 600; margin-bottom: 16px; }
        .qr   { margin: 0 auto 16px; display: block; }
        .id   { font-size: 10px; color: #c5c5d3; font-family: monospace; margin-top: 8px; }
        .slot { display: inline-block; background: #dce1ff; color: #00236f; padding: 3px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; margin-bottom: 8px; }
        @media print { body { background: white; } }
      </style></head><body>
      <div class="card">
        <div class="logo">Adarsh Library</div>
        <div class="sub">Institutional Archive</div>
        <div class="name">${student.name}</div>
        <div class="phone">${student.phone}</div>
        ${student.seat_number ? `<div class="seat">Seat ${student.seat_number}</div>` : ''}
        ${student.slot_name ? `<div class="slot">${student.slot_name}</div>` : ''}
        <img src="${img}" class="qr" width="160" height="160" />
        <div class="id">ID: ${student.qr_code}</div>
      </div>
      // eslint-disable-next-line no-useless-concat
      <script>window.onload = () => { window.print(); }</` + `</script>
      </body></html>
    `);
    win.document.close();
  };

  if (!form || !student) return <div style={{ color: '#757682', padding: 40 }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 32 }}>
        <button onClick={() => navigate('/students')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#757682', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
          Back to Directory
        </button>
        <h2 style={{ fontFamily: 'Newsreader, serif', fontSize: 32, fontWeight: 600, color: '#00236f' }}>Student Profile</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' }}>

        {/* Edit form */}
        <form onSubmit={handleSubmit}>
          <div style={{ background: 'white', border: '1px solid #e3e1e9', borderRadius: 4, padding: 32 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {[['Full Name', 'name', 'text'], ['Phone', 'phone', 'tel'], ['Email', 'email', 'email'], ['Join Date', 'joined_at', 'date']].map(([label, key, type]) => (
                <div key={key}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#757682', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>{label}</label>
                  <input type={type} value={form[key] || ''} onChange={set(key)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e3e1e9', borderRadius: 4, fontSize: 14, outline: 'none' }} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#757682', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Address</label>
              <textarea value={form.address} onChange={set('address')} rows={3} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e3e1e9', borderRadius: 4, fontSize: 14, outline: 'none', resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#757682', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Status</label>
                <select value={form.status} onChange={set('status')} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e3e1e9', borderRadius: 4, fontSize: 14, outline: 'none' }}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#757682', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Notifications</label>
                <select value={form.notification_channel} onChange={set('notification_channel')} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e3e1e9', borderRadius: 4, fontSize: 14, outline: 'none' }}>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>
          </div>

          {error && <div style={{ background: '#ffdad6', color: '#93000a', padding: '12px 16px', borderRadius: 4, fontSize: 13, marginTop: 16 }}>{error}</div>}

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button type="button" onClick={() => navigate('/students')} style={{ padding: '12px 24px', border: '1px solid #e3e1e9', background: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ padding: '12px 32px', background: '#00236f', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* QR ID Card */}
        <div>
          <div ref={printRef} style={{ background: 'white', border: '2px solid #00236f', borderRadius: 8, padding: 24, textAlign: 'center' }}>
            {/* Library header */}
            <div style={{ fontFamily: 'Newsreader, serif', fontWeight: 900, fontSize: 16, color: '#00236f', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>
              Adarsh Library
            </div>
            <div style={{ fontSize: 9, color: '#757682', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16 }}>
              Institutional Archive
            </div>

            {/* Student info */}
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1b21', marginBottom: 2 }}>{student.name}</div>
            <div style={{ fontSize: 12, color: '#757682', marginBottom: 4 }}>{student.phone}</div>
            {student.student_login_id && (
              <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#00236f', fontWeight: 700, marginBottom: 4 }}>
                {student.student_login_id}
              </div>
            )}
            {student.seat_number && (
              <div style={{ fontSize: 12, color: '#00236f', fontWeight: 600, marginBottom: 4 }}>
                Seat {student.seat_number}
              </div>
            )}
            {student.slot_name && (
              <span style={{ display: 'inline-block', background: '#dce1ff', color: '#00236f', padding: '2px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, marginBottom: 16 }}>
                {student.slot_name}
              </span>
            )}

            {/* QR Code — fixed, generated from permanent qr_code value */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              {student.qr_code ? (
                <QRCodeCanvas
                  value={student.qr_code}
                  size={160}
                  level="M"
                  includeMargin={true}
                  bgColor="#ffffff"
                  fgColor="#00236f"
                />
              ) : (
                <div style={{ width: 160, height: 160, background: '#f4f3fa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#757682', fontSize: 12 }}>
                  No QR code
                </div>
              )}
            </div>

            {/* ID below QR */}
            <div style={{ fontSize: 9, color: '#c5c5d3', fontFamily: 'monospace', wordBreak: 'break-all', padding: '0 8px' }}>
              {student.qr_code}
            </div>
          </div>

          {/* Print button */}
          <button
            onClick={handlePrint}
            style={{ width: '100%', marginTop: 12, padding: '10px', background: '#00236f', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>print</span>
            Print ID Card
          </button>

          <div style={{ marginTop: 8, fontSize: 11, color: '#757682', textAlign: 'center' }}>
            This QR is permanent and unique to this student
          </div>
        </div>

      </div>
    </div>
  );
}
