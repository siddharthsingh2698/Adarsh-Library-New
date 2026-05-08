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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) { setError('Name and phone are required'); return; }
    if (assignSeat && (!selectedSlot || !selectedSeat || !startDate)) {
      setError('Select slot, seat and start date'); return;
    }
    setError(''); setLoading(true);

    try {
      // 1. Create student
      const { data: studentData } = await axios.post(`${API}/students`, form);
      const studentId = studentData.data.id;

      // 2. Assign seat if selected
      if (assignSeat && selectedSlot && selectedSeat) {
        await axios.post(`${API}/seats/allotments`, {
          student_id:      studentId,
          seat_id:         selectedSeat,
          slot_id:         selectedSlot,
          start_date:      startDate,
          duration_months: parseInt(durationMonths),
        });
      }

      setSuccess({
        name:             studentData.data.name,
        student_login_id: studentData.data.student_login_id,
        seat:             seats.find(s => s.id === selectedSeat)?.seat_number,
        slot:             slots.find(s => s.id === selectedSlot)?.name,
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
                <div style={{ fontSize: 16, fontWeight: 700, color: '#2b6954' }}>Seat {success.seat} — {success.slot}</div>
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

                  <Field label="Seat Number" required>
                    {!selectedSlot ? (
                      <div style={{ padding: '10px 12px', border: '1px solid #e3e1e9', borderRadius: 4, fontSize: 13, color: '#c5c5d3' }}>
                        Select a slot first
                      </div>
                    ) : seats.length === 0 ? (
                      <div style={{ padding: '10px 12px', border: '1px solid #ffdad6', borderRadius: 4, fontSize: 13, color: '#ba1a1a', background: '#ffdad6' }}>
                        No available seats for this slot
                      </div>
                    ) : (
                      <select value={selectedSeat} onChange={e => setSelectedSeat(e.target.value)} required={assignSeat} style={inputStyle}>
                        <option value="">Select seat...</option>
                        {seats.sort((a, b) => parseInt(a.seat_number) - parseInt(b.seat_number)).map(s => (
                          <option key={s.id} value={s.id}>
                            Seat {s.seat_number} — {s.zone}{s.has_locker ? ' 🔒 Locker' : ''}{s.has_power ? ' ⚡' : ''}
                          </option>
                        ))}
                      </select>
                    )}
                  </Field>

                  <Field label="Plan Duration" required>
                    <select value={durationMonths} onChange={e => setDurationMonths(e.target.value)} style={inputStyle}>
                      <option value="1">1 Month — Monthly</option>
                      <option value="3">3 Months — Quarterly</option>
                      <option value="6">6 Months — Half Yearly</option>
                      <option value="12">12 Months — Annual</option>
                    </select>
                  </Field>

                  <Field label="Start Date" required>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required={assignSeat} style={inputStyle} />
                  </Field>

                  {/* Fee preview */}
                  {selectedSlot && durationMonths && (
                    <div style={{ background: '#f4f3fa', borderRadius: 4, padding: 14, fontSize: 13 }}>
                      <div style={{ fontWeight: 700, color: '#00236f', marginBottom: 4 }}>Fee Preview</div>
                      <div style={{ color: '#444651' }}>
                        ₹{parseFloat(slots.find(s => s.id === selectedSlot)?.monthly_fee || 0).toLocaleString('en-IN')} × {durationMonths} month{durationMonths > 1 ? 's' : ''} = <strong>₹{(parseFloat(slots.find(s => s.id === selectedSlot)?.monthly_fee || 0) * parseInt(durationMonths)).toLocaleString('en-IN')}</strong>
                      </div>
                      <div style={{ fontSize: 11, color: '#757682', marginTop: 4 }}>{durationMonths} fee record{durationMonths > 1 ? 's' : ''} will be created automatically</div>
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
