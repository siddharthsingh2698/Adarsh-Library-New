import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const SectionTitle = ({ icon, title, subtitle }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
    <div style={{ width: 36, height: 36, background: '#dce1ff', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span className="material-symbols-outlined" style={{ color: '#00236f', fontSize: 18 }}>{icon}</span>
    </div>
    <div>
      <div style={{ fontFamily: 'Newsreader, serif', fontSize: 17, fontWeight: 700, color: '#00236f' }}>{title}</div>
      {subtitle && <div style={{ fontSize: 11, color: '#757682' }}>{subtitle}</div>}
    </div>
  </div>
);

const Field = ({ label, required, children }) => (
  <div>
    <label style={{ fontSize: 11, fontWeight: 700, color: '#757682', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
      {label}{required ? ' *' : ''}
    </label>
    {children}
  </div>
);

const inputStyle = {
  width: '100%', padding: '10px 12px', border: '1px solid #e3e1e9',
  borderRadius: 4, fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif',
  boxSizing: 'border-box'
};

export default function AddStudent() {
  const navigate = useNavigate();

  // Personal details
  const [form, setForm] = useState({
    name: '', phone: '', email: '', address: '',
    joined_at: new Date().toISOString().slice(0, 10),
    notification_channel: 'email',
  });

  // Seat assignment
  const [assignSeat, setAssignSeat]         = useState(true);
  const [slots, setSlots]                   = useState([]);
  const [seats, setSeats]                   = useState([]);
  const [selectedSlot, setSelectedSlot]     = useState('');
  const [selectedSeat, setSelectedSeat]     = useState('');
  const [durationMonths, setDurationMonths] = useState('1');
  const [wantLocker, setWantLocker]         = useState(false);
  const [startDate, setStartDate]           = useState(new Date().toISOString().slice(0, 10));

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(null);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  useEffect(() => {
    axios.get(`${API}/slots`).then(r => setSlots(r.data.data || [])).catch(() => {});
  }, []);

  // Load available seats when slot changes
  useEffect(() => {
    if (!selectedSlot) { setSeats([]); setSelectedSeat(''); return; }
    axios.get(`${API}/seats/map`, { params: { slot_id: selectedSlot } })
      .then(r => {
        const available = (r.data.data || []).filter(s => s.slot_status === 'available');
        setSeats(available);
        setSelectedSeat('');
      }).catch(() => {});
  }, [selectedSlot]);

  const selectedSlotObj = slots.find(s => s.id === selectedSlot);
  const isFullDay       = selectedSlotObj?.is_full_day === 1 || selectedSlotObj?.name?.toLowerCase().includes('full');
  const isShift         = selectedSlot && !isFullDay;

  // For shifts: always 1 month. For full day: 1 or 3 months.
  const effectiveDuration = isShift ? '1' : durationMonths;

  // Auto-pick first available seat (locker or normal based on preference)
  const autoSeat = (() => {
    if (!seats.length) return null;
    if (wantLocker) return seats.find(s => s.has_locker) || null;
    return seats.find(s => !s.has_locker) || seats[0];
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) { setError('Name and phone are required'); return; }
    if (assignSeat && (!selectedSlot || !startDate)) {
      setError('Select slot and start date'); return;
    }
    if (assignSeat && !selectedSeat) {
      setError('Please pick a seat from the grid'); return;
    }
    setError(''); setLoading(true);

    try {
      const { data: studentData } = await axios.post(`${API}/students`, form);
      const studentId = studentData.data.id;

      if (assignSeat && selectedSlot && selectedSeat) {
        await axios.post(`${API}/seats/allotments`, {
          student_id:      studentId,
          seat_id:         selectedSeat,
          slot_id:         selectedSlot,
          start_date:      startDate,
          duration_months: parseInt(effectiveDuration),
        });
      }

      const pickedSeat = seats.find(s => s.id === selectedSeat);
      setSuccess({
        name:             studentData.data.name,
        student_login_id: studentData.data.student_login_id,
        seat:             pickedSeat?.seat_number,
        slot:             selectedSlotObj?.name,
        has_locker:       pickedSeat?.has_locker,
        duration:         effectiveDuration,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  // Success screen
  if (success) {
    return (
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <div style={{ background: 'white', border: '2px solid #2b6954', borderRadius: 8, padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontFamily: 'Newsreader, serif', fontSize: 28, color: '#2b6954', marginBottom: 8 }}>Student Registered!</h2>
          <p style={{ color: '#444651', fontSize: 14, marginBottom: 24 }}>Share these login details with the student.</p>

          <div style={{ background: '#f4f3fa', borderRadius: 6, padding: 20, marginBottom: 24, textAlign: 'left' }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#757682', textTransform: 'uppercase', marginBottom: 4 }}>Student Name</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#00236f' }}>{success.name}</div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#757682', textTransform: 'uppercase', marginBottom: 4 }}>Login ID</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#00236f', fontFamily: 'monospace' }}>{success.student_login_id}</div>
              <div style={{ fontSize: 11, color: '#757682', marginTop: 2 }}>Student uses this to log in at /login</div>
            </div>
            {success.seat && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#757682', textTransform: 'uppercase', marginBottom: 4 }}>Assigned Seat</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#2b6954' }}>
                  Seat {success.seat} — {success.slot}
                  {success.has_locker ? ' 🔒 Locker' : ''}
                </div>
                <div style={{ fontSize: 12, color: '#757682', marginTop: 2 }}>
                  {success.duration} month{success.duration > 1 ? 's' : ''} plan
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => { setSuccess(null); setForm({ name:'',phone:'',email:'',address:'',joined_at:new Date().toISOString().slice(0,10),notification_channel:'email' }); setSelectedSlot(''); setSelectedSeat(''); }} style={{ flex: 1, padding: '12px', background: '#00236f', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
              Register Another
            </button>
            <button onClick={() => navigate('/students')} style={{ flex: 1, padding: '12px', border: '1px solid #e3e1e9', background: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
              View Directory
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <button onClick={() => navigate('/students')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#757682', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
          Back to Directory
        </button>
        <h2 style={{ fontFamily: 'Newsreader, serif', fontSize: 36, fontWeight: 600, color: '#00236f', margin: 0 }}>Register Student</h2>
        <p style={{ color: '#444651', fontSize: 14, marginTop: 4 }}>Fill all details at once — seat and plan will be assigned immediately.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Personal Details */}
            <div style={{ background: 'white', border: '1px solid #e3e1e9', borderRadius: 4, padding: 24 }}>
              <SectionTitle icon="person" title="Personal Details" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Field label="Full Name" required>
                  <input type="text" value={form.name} onChange={set('name')} placeholder="Siddharth Singh" required style={inputStyle} />
                </Field>
                <Field label="Phone Number" required>
                  <input type="tel" value={form.phone} onChange={set('phone')} placeholder="9876543210" required style={inputStyle} />
                </Field>
                <Field label="Email Address">
                  <input type="email" value={form.email} onChange={set('email')} placeholder="student@email.com" style={inputStyle} />
                </Field>
                <Field label="Address">
                  <textarea value={form.address} onChange={set('address')} rows={3} placeholder="Full address..." style={{ ...inputStyle, resize: 'vertical' }} />
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Join Date" required>
                    <input type="date" value={form.joined_at} onChange={set('joined_at')} required style={inputStyle} />
                  </Field>
                  <Field label="Notifications">
                    <select value={form.notification_channel} onChange={set('notification_channel')} style={inputStyle}>
                      <option value="email">Email</option>
                      <option value="sms">SMS / WhatsApp</option>
                      <option value="both">Both</option>
                    </select>
                  </Field>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Seat Assignment */}
            <div style={{ background: 'white', border: '1px solid #e3e1e9', borderRadius: 4, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <SectionTitle icon="event_seat" title="Seat & Plan" subtitle="Assign now or do it later" />
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#757682' }}>
                  <input type="checkbox" checked={assignSeat} onChange={e => setAssignSeat(e.target.checked)} />
                  Assign now
                </label>
              </div>

              {assignSeat ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* Step 1 — Slot */}
                  <Field label="Time Slot" required>
                    <select value={selectedSlot} onChange={e => setSelectedSlot(e.target.value)} required={assignSeat} style={inputStyle}>
                      <option value="">Select slot...</option>
                      {slots.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.start_time?.slice(0,5)}–{s.end_time?.slice(0,5)}) — ₹{parseFloat(s.monthly_fee).toLocaleString('en-IN')}/mo
                        </option>
                      ))}
                    </select>
                  </Field>

                  {/* Step 2 — Locker preference (only for Full Day) */}
                  {selectedSlot && (
                    <div style={{ display: 'flex', gap: 10 }}>
                      {[false, true].map(wl => (
                        <div
                          key={String(wl)}
                          onClick={() => setWantLocker(wl)}
                          style={{
                            flex: 1, padding: '12px 16px', borderRadius: 6, cursor: 'pointer', textAlign: 'center',
                            border: `2px solid ${wantLocker === wl ? '#00236f' : '#e3e1e9'}`,
                            background: wantLocker === wl ? '#f0f4ff' : 'white',
                          }}
                        >
                          <div style={{ fontSize: 20, marginBottom: 4 }}>{wl ? '🔒' : '💺'}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#00236f' }}>{wl ? 'With Locker' : 'Normal Seat'}</div>
                          <div style={{ fontSize: 11, color: '#757682' }}>{wl ? 'Seats 9–27' : 'Seats 1–8, 28–96'}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Step 3 — Duration (only for Full Day) */}
                  {selectedSlot && isFullDay && (
                    <Field label="Plan Duration" required>
                      <div style={{ display: 'flex', gap: 10 }}>
                        {[['1', '1 Month'], ['3', '3 Months']].map(([val, label]) => (
                          <div
                            key={val}
                            onClick={() => setDurationMonths(val)}
                            style={{
                              flex: 1, padding: '12px', borderRadius: 6, cursor: 'pointer', textAlign: 'center',
                              border: `2px solid ${durationMonths === val ? '#00236f' : '#e3e1e9'}`,
                              background: durationMonths === val ? '#f0f4ff' : 'white',
                            }}
                          >
                            <div style={{ fontSize: 15, fontWeight: 700, color: '#00236f' }}>{label}</div>
                            <div style={{ fontSize: 11, color: '#757682' }}>
                              ₹{(parseFloat(selectedSlotObj?.monthly_fee || 0) * parseInt(val)).toLocaleString('en-IN')} total
                            </div>
                          </div>
                        ))}
                      </div>
                    </Field>
                  )}

                  {/* Shift: always 1 month, show info */}
                  {selectedSlot && isShift && (
                    <div style={{ padding: '10px 14px', background: '#f0f4ff', borderRadius: 4, fontSize: 13, color: '#00236f', border: '1px solid #dce1ff' }}>
                      📅 Shift plans are always <strong>1 month</strong> — ₹{parseFloat(selectedSlotObj?.monthly_fee || 0).toLocaleString('en-IN')}
                    </div>
                  )}

                  {/* Start Date */}
                  {selectedSlot && (
                    <Field label="Start Date" required>
                      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required={assignSeat} style={inputStyle} />
                    </Field>
                  )}

                  {/* Seat picker grid */}
                  {selectedSlot && seats.length > 0 && (
                    <Field label="Pick a Seat" required>
                      <div style={{ fontSize: 11, color: '#757682', marginBottom: 8 }}>
                        Showing {wantLocker ? 'locker' : 'normal'} seats available for this slot
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 200, overflowY: 'auto', padding: 4 }}>
                        {seats
                          .filter(s => wantLocker ? s.has_locker : !s.has_locker)
                          .sort((a, b) => parseInt(a.seat_number) - parseInt(b.seat_number))
                          .map(s => (
                            <div
                              key={s.id}
                              onClick={() => setSelectedSeat(s.id)}
                              title={`Seat ${s.seat_number}${s.has_locker ? ' 🔒' : ''}${s.has_power ? ' ⚡' : ''}`}
                              style={{
                                width: 40, height: 40, borderRadius: 4, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 11, fontWeight: 700,
                                background: selectedSeat === s.id ? '#00236f' : '#f4f3fa',
                                color: selectedSeat === s.id ? 'white' : '#444651',
                                border: `2px solid ${selectedSeat === s.id ? '#00236f' : '#e3e1e9'}`,
                                transition: 'all 0.15s',
                              }}
                            >
                              {s.seat_number}
                            </div>
                          ))
                        }
                      </div>
                      {selectedSeat && (
                        <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: '#2b6954' }}>
                          ✅ Seat {seats.find(s => s.id === selectedSeat)?.seat_number} selected
                          {seats.find(s => s.id === selectedSeat)?.has_locker ? ' 🔒' : ''}
                        </div>
                      )}
                      {seats.filter(s => wantLocker ? s.has_locker : !s.has_locker).length === 0 && (
                        <div style={{ padding: '10px 12px', background: '#ffdad6', borderRadius: 4, fontSize: 13, color: '#ba1a1a' }}>
                          No {wantLocker ? 'locker' : 'normal'} seats available for this slot
                        </div>
                      )}
                    </Field>
                  )}

                  {selectedSlot && seats.length === 0 && (
                    <div style={{ padding: '10px 14px', background: '#ffdad6', borderRadius: 4, fontSize: 13, color: '#ba1a1a' }}>
                      ❌ No available seats for this slot
                    </div>
                  )}

                </div>
              ) : (
                <div style={{ padding: 16, background: '#f4f3fa', borderRadius: 4, fontSize: 13, color: '#757682', textAlign: 'center' }}>
                  Seat can be assigned later from the Seat Map page
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div style={{ background: '#ffdad6', color: '#93000a', padding: '12px 16px', borderRadius: 4, fontSize: 13, marginTop: 20 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button type="button" onClick={() => navigate('/students')} style={{ padding: '12px 24px', border: '1px solid #e3e1e9', background: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
            Cancel
          </button>
          <button type="submit" disabled={loading} style={{ padding: '12px 40px', background: loading ? '#757682' : '#00236f', color: 'white', border: 'none', borderRadius: 4, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'Newsreader, serif' }}>
            {loading ? 'Registering...' : 'Register Student'}
          </button>
        </div>
      </form>
    </div>
  );
}
