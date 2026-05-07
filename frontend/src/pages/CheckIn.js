import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

export default function CheckIn() {
  const [live, setLive] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLive = () => {
    axios.get(`${API}/checkins/live`).then(r => setLive(r.data.data)).catch(() => {});
  };

  useEffect(() => { fetchLive(); const t = setInterval(fetchLive, 30000); return () => clearInterval(t); }, []);

  const handleSearch = async () => {
    if (!search.trim()) return;
    const { data } = await axios.get(`${API}/students`, { params: { search, limit: 10 } });
    setSearchResults(data.data);
  };

  const handleCheckIn = async (student) => {
    setLoading(true);
    try {
      await axios.post(`${API}/checkins`, { student_id: student.id, seat_id: student.seat_id || null, slot_id: student.slot_id || null, method: 'manual' });
      setSearchResults([]);
      setSearch('');
      fetchLive();
    } catch (e) { alert(e.response?.data?.message || 'Check-in failed'); }
    finally { setLoading(false); }
  };

  const handleCheckOut = async (checkinId) => {
    await axios.put(`${API}/checkins/${checkinId}/checkout`);
    fetchLive();
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: 'Newsreader, serif', fontSize: 32, fontWeight: 600, color: '#00236f' }}>Check-In / Check-Out</h2>
        <p style={{ color: '#444651', fontSize: 14, marginTop: 4 }}>Manage student entry and exit. Live count: <strong>{live.length}</strong> students inside.</p>
      </div>

      {/* Search & check-in */}
      <div style={{ background: 'white', border: '1px solid #e3e1e9', borderRadius: 4, padding: 24, marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Check-In Student</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search by name or phone..."
            style={{ flex: 1, padding: '10px 14px', border: '1px solid #e3e1e9', borderRadius: 4, fontSize: 14, outline: 'none' }}
          />
          <button onClick={handleSearch} style={{ padding: '10px 20px', background: '#00236f', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
            Search
          </button>
        </div>
        {searchResults.length > 0 && (
          <div style={{ marginTop: 12, border: '1px solid #e3e1e9', borderRadius: 4, overflow: 'hidden' }}>
            {searchResults.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #f4f3fa' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#00236f' }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: '#757682' }}>{s.phone} · {s.slot_name || 'No slot'} · Seat {s.seat_number || 'unassigned'}</div>
                </div>
                <button onClick={() => handleCheckIn(s)} disabled={loading} style={{ padding: '6px 16px', background: '#2b6954', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>
                  Check In
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live occupancy */}
      <div style={{ background: 'white', border: '1px solid #e3e1e9', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f0f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Currently Inside — {live.length} students
            {live.filter(c => c.is_overtime).length > 0 && (
              <span style={{ marginLeft: 12, background: '#ffdad6', color: '#93000a', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                ⏰ {live.filter(c => c.is_overtime).length} Overtime
              </span>
            )}
          </div>
          <button onClick={fetchLive} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#00236f', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>refresh</span>
            Refresh
          </button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f4f3fa' }}>
              {['Student', 'Seat', 'Slot', 'Check-in Time', 'Duration', 'Action'].map(h => (
                <th key={h} style={{ padding: '10px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#757682', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {live.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#757682' }}>No students currently checked in</td></tr>
            ) : live.map(c => {
              const mins = Math.floor((Date.now() - new Date(c.check_in_at).getTime()) / 60000);
              const dur = mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
              // MySQL returns local time string — parse as local, not UTC
              const checkinDate = new Date(c.check_in_at.replace(' ', 'T'));
              return (
                <tr key={c.id} style={{ borderTop: '1px solid #f4f3fa' }}>
                  <td style={{ padding: '12px 24px' }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#00236f' }}>{c.student_name}</div>
                    {c.flagged ? <span style={{ fontSize: 10, background: '#ffdad6', color: '#93000a', padding: '1px 6px', borderRadius: 10, fontWeight: 700 }}>SLOT VIOLATION</span> : null}
                    {c.is_overtime ? <span style={{ fontSize: 10, background: '#ffdad6', color: '#93000a', padding: '1px 6px', borderRadius: 10, fontWeight: 700, marginLeft: 4 }}>⏰ OVERTIME</span> : null}
                  </td>
                  <td style={{ padding: '12px 24px', fontSize: 13, fontFamily: 'monospace' }}>{c.seat_number || '—'}</td>
                  <td style={{ padding: '12px 24px', fontSize: 12, color: '#757682' }}>{c.slot_name || '—'}</td>
                  <td style={{ padding: '12px 24px', fontSize: 13, fontFamily: 'monospace' }}>
                    {checkinDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </td>
                  <td style={{ padding: '12px 24px', fontSize: 13, color: '#444651' }}>{dur}</td>
                  <td style={{ padding: '12px 24px' }}>
                    <button onClick={() => handleCheckOut(c.id)} style={{ padding: '5px 14px', background: 'none', border: '1px solid #ba1a1a', color: '#ba1a1a', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                      Check Out
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
