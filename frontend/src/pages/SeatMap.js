import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const STATUS_COLORS = {
  available:   { bg: '#2b6954', label: 'Available' },
  occupied:    { bg: '#ba1a1a', label: 'Occupied' },
  reserved:    { bg: '#f39461', label: 'Reserved' },
  maintenance: { bg: '#c5c5d3', label: 'Maintenance' },
};

export default function SeatMap() {
  const [seats, setSeats] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [assignForm, setAssignForm] = useState({ student_id: '', slot_id: '', start_date: '', end_date: '', duration_months: '1' });

  const fetchSeats = useCallback(async () => {
    setLoading(true);
    try {
      const params = selectedSlot ? { slot_id: selectedSlot } : {};
      const { data } = await axios.get(`${API}/seats/map`, { params });
      setSeats(data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [selectedSlot]);

  useEffect(() => {
    axios.get(`${API}/slots`).then(r => setSlots(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => { fetchSeats(); }, [fetchSeats]);

  // Sort all seats numerically — single flat list, no zone split
  const sorted = [...seats].sort((a, b) => parseInt(a.seat_number) - parseInt(b.seat_number));

  const stats = {
    available: seats.filter(s => s.slot_status === 'available').length,
    occupied: seats.filter(s => s.slot_status === 'occupied').length,
    maintenance: seats.filter(s => s.slot_status === 'maintenance').length,
  };
  const occPct = seats.length > 0 ? Math.round((stats.occupied / seats.length) * 100) : 0;

  const handleSeatClick = (seat) => {
    setSelectedSeat(seat);
  };

  const openAssignModal = async () => {
    setAssignForm(f => ({ ...f, slot_id: selectedSlot || '' }));
    setStudentSearch('');
    setStudentsLoading(true);
    setAssignModal(true);
    try {
      const { data } = await axios.get(`${API}/students`, { params: { limit: 200, status: 'active' } });
      setStudents(data.data || []);
    } catch (e) {
      console.error('Failed to load students', e);
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!assignForm.student_id || !assignForm.slot_id || !assignForm.start_date) {
      alert('Student, slot and start date required'); return;
    }
    try {
      const res = await axios.post(`${API}/seats/allotments`, {
        student_id:      assignForm.student_id,
        seat_id:         selectedSeat.id,
        slot_id:         assignForm.slot_id,
        start_date:      assignForm.start_date,
        duration_months: parseInt(assignForm.duration_months) || 1,
      });
      alert(res.data.message);
      setAssignModal(false);
      setSelectedSeat(null);
      fetchSeats();
    } catch (e) {
      alert(e.response?.data?.message || 'Assignment failed');
    }
  };

  const handleRelease = async (allotmentId) => {
    if (!window.confirm('Release this seat?')) return;
    try {
      await axios.delete(`${API}/seats/allotments/${allotmentId}`);
      setSelectedSeat(null);
      fetchSeats();
    } catch (e) { alert('Failed to release seat'); }
  };

  const handleMaintenance = async (seatId, current) => {
    const newStatus = current === 'maintenance' ? 'available' : 'maintenance';
    await axios.put(`${API}/seats/${seatId}`, { status: newStatus });
    fetchSeats();
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
        <div>
          <nav style={{ fontSize: 11, color: '#757682', marginBottom: 6 }}>
            <span>Archive</span> <span style={{ margin: '0 6px' }}>/</span>
            <span style={{ color: '#00236f', fontWeight: 700 }}>Floor Plan</span>
          </nav>
          <h2 style={{ fontFamily: 'Newsreader, serif', fontSize: 32, fontWeight: 600, color: '#00236f' }}>Library Seat Management</h2>
          <p style={{ color: '#444651', fontSize: 14, marginTop: 4 }}>
            Real-time visualization. Manage student assignments and track occupancy across slots.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button style={{ padding: '8px 16px', border: '1px solid #00236f', color: '#00236f', background: 'none', borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
            Export Map
          </button>
        </div>
      </div>

      {/* Filters & Legend */}
      <div style={{ background: 'white', border: '1px solid #e3e1e9', borderRadius: 4, padding: 16, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setSelectedSlot('')} style={{
            padding: '6px 14px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
            background: !selectedSlot ? '#dce1ff' : '#f4f3fa', color: !selectedSlot ? '#00236f' : '#757682'
          }}>All Slots</button>
          {slots.map(s => (
            <button key={s.id} onClick={() => setSelectedSlot(s.id)} style={{
              padding: '6px 14px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
              background: selectedSlot === s.id ? '#dce1ff' : '#f4f3fa', color: selectedSlot === s.id ? '#00236f' : '#757682'
            }}>{s.name}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          {Object.entries(STATUS_COLORS).map(([key, { bg, label }]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: bg }} />
              <span style={{ fontSize: 12, color: '#444651' }}>{label}</span>
            </div>
          ))}
          <div style={{ background: '#dce1ff', color: '#00236f', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>analytics</span>
            Occupancy: {occPct}%
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
        {/* Seat map */}
        <div style={{ background: 'white', border: '1px solid #e3e1e9', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ background: '#f4f3fa', borderBottom: '1px solid #e3e1e9', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: '#00236f', fontSize: 14 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>map</span>
              Library Floor Plan
            </div>
          </div>
          <div style={{ padding: 32, minHeight: 500 }}>
            {loading ? (
              <div style={{ textAlign: 'center', color: '#757682', padding: 40 }}>Loading seat map...</div>
            ) : (
              <div>
                {/* Legend for locker seats */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, fontSize: 12, color: '#757682' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 28, height: 28, background: '#2b6954', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 8, color: 'white', fontWeight: 700 }}>1</span>
                    </div>
                    <span>Normal seat</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 28, height: 28, background: '#2b6954', borderRadius: 2, border: '2px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      <span style={{ fontSize: 8, color: 'white', fontWeight: 700 }}>9</span>
                      <span style={{ position: 'absolute', top: -5, right: -5, fontSize: 8 }}>🔒</span>
                    </div>
                    <span>Seat with locker (9–27)</span>
                  </div>
                </div>

                {/* Single unified grid — 12 per row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 36px)', gap: 8 }}>
                  {sorted.map(seat => {
                    const status = seat.slot_status || seat.status;
                    const color  = STATUS_COLORS[status]?.bg || '#c5c5d3';
                    const isSelected = selectedSeat?.id === seat.id;
                    const hasLocker  = seat.has_locker === 1 || seat.has_locker === true;

                    return (
                      <div
                        key={seat.id}
                        onClick={() => handleSeatClick(seat)}
                        title={`Seat ${seat.seat_number}${hasLocker ? ' 🔒 Locker' : ''} — ${status}${seat.student_name ? ` (${seat.student_name})` : ''}`}
                        style={{
                          width: 36, height: 36,
                          background: color,
                          borderRadius: 2,
                          border: hasLocker ? '2px solid #f59e0b' : '2px solid transparent',
                          outline: isSelected ? '2px solid #00236f' : 'none',
                          outlineOffset: 2,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          transition: 'transform 0.15s',
                          fontSize: 9,
                          fontWeight: 700,
                          color: 'white',
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        {seat.seat_number}
                        {hasLocker && (
                          <span style={{ position: 'absolute', top: -5, right: -5, fontSize: 9, lineHeight: 1 }}>🔒</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Quick insights */}
          <div style={{ background: 'white', border: '1px solid #e3e1e9', borderRadius: 4, padding: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 20 }}>Quick Insights</div>
            {[
              { label: 'Free Now', value: stats.available, icon: 'event_available', bg: '#adedd3', color: '#2b6954' },
              { label: 'Occupied', value: stats.occupied, icon: 'warning', bg: '#ffdad6', color: '#ba1a1a' },
              { label: 'Maintenance', value: stats.maintenance, icon: 'build', bg: '#ffdbcb', color: '#773205' },
            ].map(({ label, value, icon, bg, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid #f4f3fa' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, background: bg, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ color, fontSize: 18 }}>{icon}</span>
                  </div>
                  <span style={{ fontSize: 12, color: '#444651' }}>{label}</span>
                </div>
                <span style={{ fontWeight: 700, color: '#00236f', fontSize: 16 }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Selected seat detail */}
          {selectedSeat ? (
            <div style={{ background: '#00236f', borderRadius: 4, padding: 24, color: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 10, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Selected Seat</div>
                  <div style={{ fontFamily: 'Newsreader, serif', fontSize: 28, fontWeight: 700 }}>{selectedSeat.seat_number}</div>
                </div>
                <button onClick={() => setSelectedSeat(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20, fontSize: 13, opacity: 0.9 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Status:</span>
                  <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{selectedSeat.slot_status || selectedSeat.status}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Zone:</span>
                  <span style={{ fontWeight: 700 }}>{selectedSeat.zone}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Power Outlet:</span>
                  <span style={{ fontWeight: 700 }}>{selectedSeat.has_power ? 'Yes' : 'No'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Locker:</span>
                  <span style={{ fontWeight: 700 }}>
                    {(selectedSeat.has_locker === 1 || selectedSeat.has_locker === true) ? '🔒 Included' : 'No'}
                  </span>
                </div>
                {selectedSeat.student_name && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Student:</span>
                    <span style={{ fontWeight: 700 }}>{selectedSeat.student_name}</span>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedSeat.slot_status === 'available' && (
                  <button onClick={openAssignModal} style={{ width: '100%', padding: 10, background: 'white', color: '#00236f', border: 'none', borderRadius: 4, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                    Assign Student
                  </button>
                )}
                {selectedSeat.slot_status === 'occupied' && selectedSeat.allotment_id && (
                  <button onClick={() => handleRelease(selectedSeat.allotment_id)} style={{ width: '100%', padding: 10, background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 4, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                    Release Seat
                  </button>
                )}
                <button onClick={() => handleMaintenance(selectedSeat.id, selectedSeat.status)} style={{ width: '100%', padding: 10, background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 4, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                  {selectedSeat.status === 'maintenance' ? 'Mark Available' : 'Mark Maintenance'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ background: 'white', border: '1px solid #e3e1e9', borderRadius: 4, padding: 24, textAlign: 'center', color: '#757682', fontSize: 13 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 40, display: 'block', marginBottom: 8, color: '#c5c5d3' }}>event_seat</span>
              Click a seat to view details
            </div>
          )}
        </div>
      </div>

      {/* Assign Modal */}
      {assignModal && selectedSeat && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', borderRadius: 4, padding: 32, width: 440, maxWidth: '90vw' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'Newsreader, serif', fontSize: 22, color: '#00236f' }}>
                Assign Seat {selectedSeat.seat_number}
                {(selectedSeat.has_locker === 1 || selectedSeat.has_locker === true) && (
                  <span style={{ fontSize: 14, marginLeft: 8, color: '#f59e0b' }}>🔒 + Locker</span>
                )}
              </h3>
              <button onClick={() => setAssignModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#757682', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Student</label>
                <input
                  type="text"
                  placeholder="Search by name or phone..."
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e3e1e9', borderRadius: '4px 4px 0 0', fontSize: 13, outline: 'none', borderBottom: 'none' }}
                />
                <select
                  value={assignForm.student_id}
                  onChange={e => setAssignForm(f => ({ ...f, student_id: e.target.value }))}
                  size={5}
                  style={{ width: '100%', padding: '4px', border: '1px solid #e3e1e9', borderRadius: '0 0 4px 4px', fontSize: 13, outline: 'none', display: 'block' }}
                >
                  {studentsLoading
                    ? <option disabled>Loading students...</option>
                    : students.length === 0
                      ? <option disabled>No active students found</option>
                      : students
                          .filter(s =>
                            !studentSearch ||
                            s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                            s.phone.includes(studentSearch)
                          )
                          .map(s => (
                            <option key={s.id} value={s.id}>
                              {s.name} — {s.phone}
                            </option>
                          ))
                  }
                </select>
                {assignForm.student_id && (
                  <div style={{ fontSize: 11, color: '#2b6954', marginTop: 4, fontWeight: 600 }}>
                    ✓ Selected: {students.find(s => s.id === assignForm.student_id)?.name}
                  </div>
                )}
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#757682', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Time Slot</label>
                <select value={assignForm.slot_id} onChange={e => setAssignForm(f => ({ ...f, slot_id: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e3e1e9', borderRadius: 4, fontSize: 13, outline: 'none' }}>
                  <option value="">Select slot...</option>
                  {slots.map(s => <option key={s.id} value={s.id}>{s.name} ({s.start_time}–{s.end_time}) — ₹{parseFloat(s.monthly_fee).toLocaleString('en-IN')}/mo</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#757682', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Plan Duration</label>
                <select value={assignForm.duration_months} onChange={e => setAssignForm(f => ({ ...f, duration_months: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e3e1e9', borderRadius: 4, fontSize: 13, outline: 'none' }}>
                  <option value="1">1 Month</option>
                  <option value="3">3 Months (Quarterly)</option>
                  <option value="6">6 Months</option>
                  <option value="12">12 Months (Annual)</option>
                </select>
                <p style={{ fontSize: 11, color: '#757682', marginTop: 4 }}>Fee records auto-generated for each month</p>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#757682', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Start Date</label>
                <input type="date" value={assignForm.start_date} onChange={e => setAssignForm(f => ({ ...f, start_date: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e3e1e9', borderRadius: 4, fontSize: 13, outline: 'none' }} />
              </div>
              {(selectedSeat?.has_locker === 1 || selectedSeat?.has_locker === true) && (
                <div style={{ padding: '8px 12px', background: '#fff8e1', border: '1px solid #f59e0b', borderRadius: 4, fontSize: 12, color: '#92400e' }}>
                  🔒 This seat includes a locker
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button onClick={() => setAssignModal(false)} style={{ flex: 1, padding: 10, border: '1px solid #e3e1e9', background: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Cancel</button>
              <button onClick={handleAssign} style={{ flex: 1, padding: 10, background: '#00236f', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Assign Seat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
