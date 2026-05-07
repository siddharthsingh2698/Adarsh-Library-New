import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';
const KIOSK_URL = `${window.location.origin}/kiosk`;

const card = (style = {}) => ({
  background: 'white', border: '1px solid #e3e1e9', borderRadius: 2, padding: 24, ...style
});

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/dashboard`)
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: '#757682', fontFamily: 'Newsreader, serif', fontSize: 18 }}>Loading dashboard...</div>;

  const occ = data?.occupancy || {};
  const dues = data?.dues || {};
  const students = data?.students || {};
  const checkins = data?.recent_checkins || [];
  const slots = data?.slot_stats || [];

  const occPct = occ.percentage || 0;
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (occPct / 100) * circumference;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: 'Newsreader, serif', fontSize: 32, fontWeight: 600, color: '#00236f' }}>
          Institutional Overview
        </h2>
        <p style={{ color: '#444651', fontSize: 14, marginTop: 4 }}>
          Real-time resource management and student activity tracking.
        </p>
      </div>

      {/* Top metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
        {/* Occupancy ring */}
        <div style={{ ...card(), display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#444651', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16, width: '100%', textAlign: 'left' }}>
            Today's Occupancy
          </div>
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="128" height="128">
              <circle cx="64" cy="64" r={radius} fill="transparent" stroke="#f1f0f7" strokeWidth="8" />
              <circle cx="64" cy="64" r={radius} fill="transparent" stroke="#00236f"
                strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={dashOffset}
                strokeLinecap="round" style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.5s' }} />
            </svg>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#00236f', fontFamily: 'Newsreader, serif' }}>{occPct}%</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#757682', textTransform: 'uppercase' }}>Capacity</div>
            </div>
          </div>
          <p style={{ marginTop: 12, fontSize: 13, color: '#444651' }}>
            {occ.checked_in} / {occ.total_seats} Seats Filled
          </p>
        </div>

        {/* Pending dues */}
        <div style={card()}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#444651', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 24 }}>
            Pending Fee Dues
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 40, fontWeight: 700, color: '#ba1a1a', fontFamily: 'Newsreader, serif' }}>
                {dues.students_with_dues || 0}
              </div>
              <p style={{ fontSize: 13, color: '#757682', marginTop: 4 }}>Outstanding Ledgers</p>
            </div>
            <div style={{ background: '#ffdad6', padding: 12, borderRadius: 4 }}>
              <span className="material-symbols-outlined" style={{ color: '#ba1a1a' }}>payments</span>
            </div>
          </div>
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f1f0f7' }}>
            <button onClick={() => navigate('/fees')} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 700, color: '#00236f', display: 'flex', alignItems: 'center', gap: 4
            }}>
              View all delinquencies
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Active students */}
        <div style={card()}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#444651', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 24 }}>
            Active Students
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 40, fontWeight: 700, color: '#00236f', fontFamily: 'Newsreader, serif' }}>
                {students.active?.toLocaleString() || 0}
              </div>
              <p style={{ fontSize: 13, color: '#757682', marginTop: 4 }}>Current Enrollments</p>
            </div>
            <div style={{ background: '#dce1ff', padding: 12, borderRadius: 4 }}>
              <span className="material-symbols-outlined" style={{ color: '#00236f' }}>group</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        {/* Recent check-ins */}
        <div style={{ background: 'white', border: '1px solid #e3e1e9', borderRadius: 2 }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f0f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Check-ins</div>
            <button onClick={() => navigate('/checkin')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#00236f' }}>
              View All
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f4f3fa' }}>
                {['Student', 'Seat', 'Check-in Time', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#757682', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {checkins.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#757682', fontSize: 13 }}>No check-ins today</td></tr>
              ) : checkins.map(c => (
                <tr key={c.id} style={{ borderTop: '1px solid #f4f3fa' }}>
                  <td style={{ padding: '14px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', background: '#dce1ff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, color: '#00236f'
                      }}>
                        {c.student_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#00236f' }}>{c.student_name}</div>
                        <div style={{ fontSize: 10, color: '#757682', textTransform: 'uppercase' }}>{c.slot_name}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: 13, color: '#444651', fontFamily: 'Inter, monospace' }}>{c.seat_number || '—'}</td>
                  <td style={{ padding: '14px 24px', fontSize: 13, color: '#444651', fontFamily: 'Inter, monospace' }}>
                    {new Date(c.check_in_at.replace(' ', 'T')).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.check_out_at ? '#c5c5d3' : '#2b6954' }} />
                      <span style={{ fontSize: 12, fontWeight: 500, color: c.check_out_at ? '#757682' : '#2b6954' }}>
                        {c.check_out_at ? 'Checked Out' : 'Active'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={card()}>
            <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 20 }}>Quick Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Add Student', icon: 'person_add', to: '/students/add', primary: true },
                { label: 'Mark Fee Paid', icon: 'price_check', to: '/fees', primary: false },
                { label: 'Assign Seat', icon: 'event_seat', to: '/seats', primary: false },
                { label: 'Check-In Student', icon: 'login', to: '/checkin', primary: false },
              ].map(({ label, icon, to, primary }) => (
                <button key={label} onClick={() => navigate(to)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', border: primary ? 'none' : '1px solid #00236f',
                  background: primary ? '#00236f' : 'transparent',
                  color: primary ? 'white' : '#00236f',
                  borderRadius: 2, cursor: 'pointer', fontSize: 13, fontWeight: 700
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>
                    {label}
                  </div>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: '#1e293b', borderRadius: 2, padding: 24, color: 'white', position: 'relative', overflow: 'hidden' }}>
            <h4 style={{ fontFamily: 'Newsreader, serif', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>System Health</h4>
            <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>All library systems operating normally.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2b6954', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2b6954' }}>Optimal Performance</span>
            </div>
            <span className="material-symbols-outlined" style={{ position: 'absolute', right: -16, bottom: -16, fontSize: 96, color: 'rgba(255,255,255,0.05)' }}>verified_user</span>
          </div>
        </div>
      </div>
    </div>
  );
}
