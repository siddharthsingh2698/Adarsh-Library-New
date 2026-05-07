import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

export default function Reports() {
  const [revenue, setRevenue] = useState([]);
  const [occupancy, setOccupancy] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/reports/revenue`),
      axios.get(`${API}/reports/occupancy`),
      axios.get(`${API}/reports/attendance`),
    ]).then(([r, o, a]) => {
      setRevenue(r.data.data.reverse());
      setOccupancy(o.data.data);
      setAttendance(a.data.data.slice(0, 20));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: '#757682', padding: 40 }}>Loading reports...</div>;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: 'Newsreader, serif', fontSize: 32, fontWeight: 600, color: '#00236f' }}>Reports & Analytics</h2>
        <p style={{ color: '#444651', fontSize: 14, marginTop: 4 }}>Revenue, occupancy, and attendance insights.</p>
      </div>

      {/* Revenue chart */}
      <div style={{ background: 'white', border: '1px solid #e3e1e9', borderRadius: 4, padding: 24, marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 20 }}>Monthly Revenue (Last 12 Months)</div>
        {revenue.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#757682', padding: 40 }}>No revenue data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f0f7" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => `₹${parseFloat(v).toLocaleString('en-IN')}`} />
              <Legend />
              <Bar dataKey="collected" name="Collected" fill="#2b6954" radius={[2,2,0,0]} />
              <Bar dataKey="pending" name="Pending" fill="#ffdad6" radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Occupancy by slot */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div style={{ background: 'white', border: '1px solid #e3e1e9', borderRadius: 4, padding: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 20 }}>Slot Occupancy</div>
          {occupancy.map(s => (
            <div key={s.slot} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ fontWeight: 600 }}>{s.slot}</span>
                <span style={{ color: '#757682' }}>{s.enrolled}/{s.capacity} ({s.fill_rate}%)</span>
              </div>
              <div style={{ height: 8, background: '#f1f0f7', borderRadius: 4 }}>
                <div style={{ height: '100%', width: `${s.fill_rate}%`, background: s.fill_rate > 80 ? '#ba1a1a' : '#2b6954', borderRadius: 4, transition: 'width 0.5s' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Top attendance */}
        <div style={{ background: 'white', border: '1px solid #e3e1e9', borderRadius: 4, padding: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 20 }}>Student Attendance (This Month)</div>
          {attendance.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#757682', padding: 20 }}>No attendance data</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {attendance.slice(0, 10).map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f4f3fa' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#00236f' }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: '#757682' }}>{s.days_present} days present</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: s.attendance_pct >= 75 ? '#2b6954' : '#ba1a1a' }}>{s.attendance_pct}%</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
