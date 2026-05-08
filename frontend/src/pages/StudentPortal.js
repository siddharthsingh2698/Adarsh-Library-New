import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const STATUS_COLORS = {
  available:   '#2b6954',
  occupied:    '#ba1a1a',
  reserved:    '#f59e0b',
  maintenance: '#c5c5d3',
};

export default function StudentPortal() {
  const navigate  = useNavigate();
  const [me, setMe]           = useState(null);
  const [present, setPresent] = useState([]);
  const [seats, setSeats]     = useState([]);
  const [tab, setTab]         = useState('overview');
  const [loading, setLoading] = useState(true);

  const student = JSON.parse(localStorage.getItem('alms_student') || 'null');
  const token   = localStorage.getItem('alms_student_token');

  useEffect(() => {
    if (!token || !student) { navigate('/login'); return; }
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      axios.get(`${API}/portal/me`,      { headers }),
      axios.get(`${API}/portal/present`, { headers }),
      axios.get(`${API}/portal/seats`,   { headers }),
    ]).then(([meRes, presentRes, seatsRes]) => {
      setMe(meRes.data.data);
      setPresent(presentRes.data.data);
      setSeats(seatsRes.data.data);
    }).catch(() => navigate('/login'))
      .finally(() => setLoading(false));
  }, [navigate, token]);

  const handleLogout = () => {
    localStorage.removeItem('alms_student_token');
    localStorage.removeItem('alms_student');
    navigate('/login');
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Newsreader, serif', fontSize: 18, color: '#00236f' }}>Loading...</div>;

  const pendingFees = me?.fees?.filter(f => f.status === 'pending' || f.status === 'overdue') || [];
  const paidFees    = me?.fees?.filter(f => f.status === 'paid') || [];

  const sorted = [...seats].sort((a, b) => parseInt(a.seat_number) - parseInt(b.seat_number));

  return (
    <div style={{ minHeight: '100vh', background: '#f4f3fa', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <header style={{ background: '#00236f', color: 'white', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>account_balance</span>
          <span style={{ fontFamily: 'Newsreader, serif', fontWeight: 900, fontSize: 18, textTransform: 'uppercase' }}>Adarsh Library</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{me?.name}</div>
            <div style={{ fontSize: 11, opacity: 0.7, fontFamily: 'monospace' }}>{me?.student_login_id}</div>
          </div>
          <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '6px 14px', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
            Logout
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* Tab nav */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: 'white', border: '1px solid #e3e1e9', borderRadius: 4, padding: 4, width: 'fit-content' }}>
          {[['overview', 'My Overview'], ['seats', 'Seat Map'], ['present', 'Who\'s Here'], ['fees', 'My Fees']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: '8px 20px', border: 'none', borderRadius: 3, cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: tab === key ? '#00236f' : 'transparent',
              color: tab === key ? 'white' : '#757682'
            }}>{label}</button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* My Seat & Plan */}
            <div style={{ background: 'white', border: '1px solid #e3e1e9', borderRadius: 4, padding: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#757682', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>My Seat & Plan</div>
              {me?.seat_number ? (
                <div>
                  <div style={{ fontFamily: 'Newsreader, serif', fontSize: 48, fontWeight: 700, color: '#00236f', lineHeight: 1 }}>{me.seat_number}</div>
                  <div style={{ fontSize: 13, color: '#757682', marginTop: 4 }}>{me.zone}</div>
                  <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#757682' }}>Slot</span>
                      <span style={{ fontWeight: 700 }}>{me.slot_name} ({me.start_time?.slice(0,5)}–{me.end_time?.slice(0,5)})</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#757682' }}>Plan</span>
                      <span style={{ fontWeight: 700 }}>{me.duration_months} Month{me.duration_months > 1 ? 's' : ''}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#757682' }}>Valid Until</span>
                      <span style={{ fontWeight: 700 }}>{me.end_date ? new Date(me.end_date).toLocaleDateString('en-IN') : '—'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#757682' }}>Locker</span>
                      <span style={{ fontWeight: 700 }}>{me.has_locker ? '🔒 Included' : 'No'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#757682' }}>Monthly Fee</span>
                      <span style={{ fontWeight: 700 }}>₹{parseFloat(me.monthly_fee || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ color: '#757682', fontSize: 14 }}>No seat assigned yet</div>
              )}
            </div>

            {/* Status cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Check-in status */}
              <div style={{ background: me?.currently_checked_in ? '#adedd3' : '#f4f3fa', border: `1px solid ${me?.currently_checked_in ? '#2b6954' : '#e3e1e9'}`, borderRadius: 4, padding: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: me?.currently_checked_in ? '#2b6954' : '#757682', textTransform: 'uppercase', marginBottom: 8 }}>Current Status</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: me?.currently_checked_in ? '#2b6954' : '#444651' }}>
                  {me?.currently_checked_in ? '✅ Checked In' : '⭕ Not Checked In'}
                </div>
                {me?.checkin && (
                  <div style={{ fontSize: 12, color: '#2b6954', marginTop: 4 }}>
                    Since {new Date(me.checkin.check_in_at.replace(' ', 'T')).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </div>
                )}
              </div>

              {/* Pending fees */}
              <div style={{ background: pendingFees.length ? '#ffdad6' : '#adedd3', border: `1px solid ${pendingFees.length ? '#ba1a1a' : '#2b6954'}`, borderRadius: 4, padding: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: pendingFees.length ? '#ba1a1a' : '#2b6954', textTransform: 'uppercase', marginBottom: 8 }}>Fee Status</div>
                {pendingFees.length ? (
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#ba1a1a' }}>
                      ₹{pendingFees.reduce((a, f) => a + parseFloat(f.amount), 0).toLocaleString('en-IN')} Due
                    </div>
                    <div style={{ fontSize: 12, color: '#93000a', marginTop: 4 }}>{pendingFees.length} pending payment{pendingFees.length > 1 ? 's' : ''}</div>
                  </div>
                ) : (
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#2b6954' }}>✅ All Clear</div>
                )}
              </div>

              {/* Students present */}
              <div style={{ background: 'white', border: '1px solid #e3e1e9', borderRadius: 4, padding: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#757682', textTransform: 'uppercase', marginBottom: 8 }}>Currently Present</div>
                <div style={{ fontFamily: 'Newsreader, serif', fontSize: 32, fontWeight: 700, color: '#00236f' }}>{present.length}</div>
                <div style={{ fontSize: 12, color: '#757682' }}>students in library</div>
              </div>
            </div>
          </div>
        )}

        {/* ── SEAT MAP ── */}
        {tab === 'seats' && (
          <div style={{ background: 'white', border: '1px solid #e3e1e9', borderRadius: 4, padding: 24 }}>
            <div style={{ display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
              {Object.entries({ available: 'Available', occupied: 'Occupied', reserved: 'Absent (Walk-in OK)', maintenance: 'Maintenance' }).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: STATUS_COLORS[k] }} />
                  <span style={{ fontSize: 12, color: '#444651' }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 36px)', gap: 8 }}>
              {sorted.map(seat => {
                const color = STATUS_COLORS[seat.slot_status] || '#c5c5d3';
                const isMySeats = me?.seat_number === seat.seat_number;
                return (
                  <div
                    key={seat.seat_number}
                    title={`Seat ${seat.seat_number} — ${seat.slot_status}${seat.slot_name ? ` (${seat.slot_name})` : ''}`}
                    style={{
                      width: 36, height: 36, background: color, borderRadius: 2,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, fontWeight: 700, color: 'white',
                      border: isMySeats ? '3px solid #00236f' : seat.has_locker ? '2px solid #f59e0b' : '2px solid transparent',
                      position: 'relative',
                    }}
                  >
                    {seat.seat_number}
                    {isMySeats && <span style={{ position: 'absolute', top: -8, right: -8, fontSize: 10 }}>⭐</span>}
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: 11, color: '#757682', marginTop: 16 }}>⭐ = Your seat &nbsp; 🔒 border = Locker seat</p>
          </div>
        )}

        {/* ── WHO'S HERE ── */}
        {tab === 'present' && (
          <div style={{ background: 'white', border: '1px solid #e3e1e9', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f0f7', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {present.length} Students Currently Inside
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f4f3fa' }}>
                  {['Student', 'Seat', 'Slot', 'Check-in Time'].map(h => (
                    <th key={h} style={{ padding: '10px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#757682', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {present.length === 0 ? (
                  <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: '#757682' }}>No students currently checked in</td></tr>
                ) : present.map((p, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #f4f3fa' }}>
                    <td style={{ padding: '12px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#dce1ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#00236f' }}>
                          {p.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 13, color: '#00236f' }}>{p.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 24px', fontSize: 13, fontFamily: 'monospace' }}>{p.seat_number || '—'}</td>
                    <td style={{ padding: '12px 24px', fontSize: 12, color: '#757682' }}>{p.slot_name || '—'}</td>
                    <td style={{ padding: '12px 24px', fontSize: 13, fontFamily: 'monospace' }}>
                      {new Date(p.check_in_at.replace(' ', 'T')).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── FEES ── */}
        {tab === 'fees' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                { label: 'Total Paid', value: `₹${paidFees.reduce((a, f) => a + parseFloat(f.amount), 0).toLocaleString('en-IN')}`, color: '#2b6954', bg: '#adedd3' },
                { label: 'Pending', value: `₹${pendingFees.reduce((a, f) => a + parseFloat(f.amount), 0).toLocaleString('en-IN')}`, color: '#ba1a1a', bg: '#ffdad6' },
                { label: 'Total Records', value: me?.fees?.length || 0, color: '#00236f', bg: '#dce1ff' },
              ].map(({ label, value, color, bg }) => (
                <div key={label} style={{ background: 'white', border: '1px solid #e3e1e9', borderRadius: 4, padding: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#757682', textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
                  <div style={{ fontFamily: 'Newsreader, serif', fontSize: 28, fontWeight: 700, color }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Fee list */}
            <div style={{ background: 'white', border: '1px solid #e3e1e9', borderRadius: 4, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f4f3fa' }}>
                    {['Slot', 'Amount', 'Due Date', 'Paid Date', 'Status'].map(h => (
                      <th key={h} style={{ padding: '10px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#757682', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(me?.fees || []).map(f => {
                    const statusColors = { paid: { bg: '#adedd3', color: '#306d58' }, pending: { bg: '#ffdad6', color: '#93000a' }, overdue: { bg: '#ffdad6', color: '#93000a' } };
                    const sc = statusColors[f.status] || { bg: '#f1f0f7', color: '#757682' };
                    return (
                      <tr key={f.id} style={{ borderTop: '1px solid #f4f3fa' }}>
                        <td style={{ padding: '12px 24px', fontSize: 13 }}>{f.slot_name || 'General'}</td>
                        <td style={{ padding: '12px 24px', fontSize: 14, fontWeight: 700 }}>₹{parseFloat(f.amount).toLocaleString('en-IN')}</td>
                        <td style={{ padding: '12px 24px', fontSize: 12, fontFamily: 'monospace', color: '#757682' }}>{new Date(f.due_date).toLocaleDateString('en-IN')}</td>
                        <td style={{ padding: '12px 24px', fontSize: 12, fontFamily: 'monospace', color: '#757682' }}>{f.paid_date ? new Date(f.paid_date).toLocaleDateString('en-IN') : '—'}</td>
                        <td style={{ padding: '12px 24px' }}>
                          <span style={{ ...sc, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{f.status?.toUpperCase()}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
