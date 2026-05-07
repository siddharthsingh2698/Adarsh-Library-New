import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Configuration() {
  const [config, setConfig] = useState({ library_name: '', open_time: '06:00', close_time: '22:00', open_days: ['Mon','Tue','Wed','Thu','Fri'] });
  const [slots, setSlots] = useState([]);
  const [saved, setSaved] = useState(false);
  const [newSlot, setNewSlot] = useState({ name: '', start_time: '', end_time: '', monthly_fee: '', capacity: '' });
  const [showSlotForm, setShowSlotForm] = useState(false);

  useEffect(() => {
    axios.get(`${API}/config`).then(r => { if (r.data.data?.library_name) setConfig(r.data.data); }).catch(() => {});
    axios.get(`${API}/slots`).then(r => setSlots(r.data.data)).catch(() => {});
  }, []);

  const toggleDay = (day) => {
    setConfig(c => ({
      ...c,
      open_days: c.open_days?.includes(day)
        ? c.open_days.filter(d => d !== day)
        : [...(c.open_days || []), day]
    }));
  };

  const handleSave = async () => {
    await axios.put(`${API}/config`, config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddSlot = async () => {
    if (!newSlot.name || !newSlot.start_time || !newSlot.end_time) { alert('Name, start and end time required'); return; }
    await axios.post(`${API}/slots`, newSlot);
    const r = await axios.get(`${API}/slots`);
    setSlots(r.data.data);
    setNewSlot({ name: '', start_time: '', end_time: '', monthly_fee: '', capacity: '' });
    setShowSlotForm(false);
  };

  const handleDeleteSlot = async (id) => {
    if (!window.confirm('Deactivate this slot?')) return;
    await axios.delete(`${API}/slots/${id}`);
    setSlots(s => s.filter(sl => sl.id !== id));
  };

  const label = (text) => (
    <label style={{ fontSize: 11, fontWeight: 700, color: '#757682', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>{text}</label>
  );

  const input = (props) => (
    <input {...props} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e3e1e9', borderRadius: 4, fontSize: 13, outline: 'none', ...props.style }} />
  );

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: 'Newsreader, serif', fontSize: 40, fontWeight: 600, color: '#00236f' }}>Library Configuration</h2>
        <p style={{ color: '#444651', fontSize: 14, marginTop: 4 }}>Define institutional parameters for scheduling and fee structures.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Library info */}
          <section style={{ background: 'white', border: '1px solid #e3e1e9', borderRadius: 4, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <span className="material-symbols-outlined" style={{ color: '#00236f' }}>account_balance</span>
              <h3 style={{ fontFamily: 'Newsreader, serif', fontSize: 20, color: '#00236f' }}>Library Info</h3>
            </div>
            <div>
              {label('Library Name')}
              {input({ value: config.library_name || '', onChange: e => setConfig(c => ({ ...c, library_name: e.target.value })), placeholder: 'Adarsh Library' })}
            </div>
          </section>

          {/* Opening hours */}
          <section style={{ background: 'white', border: '1px solid #e3e1e9', borderRadius: 4, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <span className="material-symbols-outlined" style={{ color: '#00236f' }}>schedule</span>
              <h3 style={{ fontFamily: 'Newsreader, serif', fontSize: 20, color: '#00236f' }}>Opening Hours</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 20 }}>
              {DAYS.map(day => {
                const active = config.open_days?.includes(day);
                return (
                  <div key={day} onClick={() => toggleDay(day)} style={{
                    padding: '10px 4px', textAlign: 'center', borderRadius: 4, cursor: 'pointer',
                    border: `1px solid ${active ? '#dce1ff' : '#e3e1e9'}`,
                    background: active ? '#dce1ff' : '#f4f3fa'
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: active ? '#00236f' : '#757682', textTransform: 'uppercase', marginBottom: 6 }}>{day}</div>
                    <div style={{ width: 16, height: 16, borderRadius: 3, border: `2px solid ${active ? '#00236f' : '#c5c5d3'}`, background: active ? '#00236f' : 'white', margin: '0 auto' }} />
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                {label('Opens At')}
                {input({ type: 'time', value: config.open_time || '06:00', onChange: e => setConfig(c => ({ ...c, open_time: e.target.value })) })}
              </div>
              <div>
                {label('Closes At')}
                {input({ type: 'time', value: config.close_time || '22:00', onChange: e => setConfig(c => ({ ...c, close_time: e.target.value })) })}
              </div>
            </div>
          </section>

          {/* Time slots */}
          <section style={{ background: 'white', border: '1px solid #e3e1e9', borderRadius: 4, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="material-symbols-outlined" style={{ color: '#00236f' }}>history_toggle_off</span>
                <h3 style={{ fontFamily: 'Newsreader, serif', fontSize: 20, color: '#00236f' }}>Time Slots</h3>
              </div>
              <button onClick={() => setShowSlotForm(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#00236f', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                Add Slot
              </button>
            </div>

            {showSlotForm && (
              <div style={{ background: '#f4f3fa', borderRadius: 4, padding: 16, marginBottom: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div><label style={{ fontSize: 11, fontWeight: 700, color: '#757682', display: 'block', marginBottom: 4 }}>Name</label>
                    <input value={newSlot.name} onChange={e => setNewSlot(s => ({ ...s, name: e.target.value }))} placeholder="Morning" style={{ width: '100%', padding: '6px 10px', border: '1px solid #e3e1e9', borderRadius: 4, fontSize: 13, outline: 'none' }} /></div>
                  <div><label style={{ fontSize: 11, fontWeight: 700, color: '#757682', display: 'block', marginBottom: 4 }}>Monthly Fee (₹)</label>
                    <input type="number" value={newSlot.monthly_fee} onChange={e => setNewSlot(s => ({ ...s, monthly_fee: e.target.value }))} placeholder="800" style={{ width: '100%', padding: '6px 10px', border: '1px solid #e3e1e9', borderRadius: 4, fontSize: 13, outline: 'none' }} /></div>
                  <div><label style={{ fontSize: 11, fontWeight: 700, color: '#757682', display: 'block', marginBottom: 4 }}>Start Time</label>
                    <input type="time" value={newSlot.start_time} onChange={e => setNewSlot(s => ({ ...s, start_time: e.target.value }))} style={{ width: '100%', padding: '6px 10px', border: '1px solid #e3e1e9', borderRadius: 4, fontSize: 13, outline: 'none' }} /></div>
                  <div><label style={{ fontSize: 11, fontWeight: 700, color: '#757682', display: 'block', marginBottom: 4 }}>End Time</label>
                    <input type="time" value={newSlot.end_time} onChange={e => setNewSlot(s => ({ ...s, end_time: e.target.value }))} style={{ width: '100%', padding: '6px 10px', border: '1px solid #e3e1e9', borderRadius: 4, fontSize: 13, outline: 'none' }} /></div>
                  <div><label style={{ fontSize: 11, fontWeight: 700, color: '#757682', display: 'block', marginBottom: 4 }}>Capacity</label>
                    <input type="number" value={newSlot.capacity} onChange={e => setNewSlot(s => ({ ...s, capacity: e.target.value }))} placeholder="60" style={{ width: '100%', padding: '6px 10px', border: '1px solid #e3e1e9', borderRadius: 4, fontSize: 13, outline: 'none' }} /></div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setShowSlotForm(false)} style={{ padding: '6px 16px', border: '1px solid #e3e1e9', background: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Cancel</button>
                  <button onClick={handleAddSlot} style={{ padding: '6px 16px', background: '#00236f', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Save Slot</button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {slots.map(slot => (
                <div key={slot.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: '#f4f3fa', borderRadius: 4, border: '1px solid #e3e1e9' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#757682', textTransform: 'uppercase' }}>{slot.name}</div>
                    <div style={{ fontWeight: 700, color: '#00236f', fontSize: 14 }}>{slot.start_time} — {slot.end_time}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: '#757682', textTransform: 'uppercase' }}>Capacity</div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{slot.capacity}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: '#757682', textTransform: 'uppercase' }}>Monthly Fee</div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>₹{slot.monthly_fee}</div>
                  </div>
                  <button onClick={() => handleDeleteSlot(slot.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c5c5d3', padding: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <section style={{ background: '#00236f', borderRadius: 4, padding: 24, color: 'white' }}>
            <h4 style={{ fontFamily: 'Newsreader, serif', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Capacity Forecasting</h4>
            <p style={{ fontSize: 13, color: '#b6c4ff', marginBottom: 20 }}>
              Current slot configurations allow for {slots.reduce((a, s) => a + parseInt(s.capacity || 0), 0)} simultaneous students.
            </p>
            {slots.map(s => {
              const pct = s.capacity > 0 ? Math.round((s.enrolled / s.capacity) * 100) : 0;
              return (
                <div key={s.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: '#b6c4ff' }}>{s.name}</span>
                    <span style={{ fontWeight: 700 }}>{s.enrolled || 0}/{s.capacity}</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: '#b6c4ff', borderRadius: 2 }} />
                  </div>
                </div>
              );
            })}
          </section>

          <section style={{ background: 'white', border: '1px solid #e3e1e9', borderRadius: 4, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <span className="material-symbols-outlined" style={{ color: '#00236f' }}>notifications</span>
              <h3 style={{ fontFamily: 'Newsreader, serif', fontSize: 20, color: '#00236f' }}>Notification Settings</h3>
            </div>
            <div>
              {label('Fee Reminder Days (before due)')}
              <input value={(config.fee_reminder_days || [7,3,1]).join(', ')} onChange={e => setConfig(c => ({ ...c, fee_reminder_days: e.target.value.split(',').map(d => parseInt(d.trim())).filter(Boolean) }))} placeholder="7, 3, 1" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e3e1e9', borderRadius: 4, fontSize: 13, outline: 'none' }} />
              <p style={{ fontSize: 11, color: '#757682', marginTop: 4 }}>Comma-separated days before due date to send reminders</p>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #e3e1e9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#757682', fontSize: 12 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>info</span>
            All changes are logged in the Institutional Audit Ledger.
          </div>
          <a href="/library" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#00236f', textDecoration: 'none', padding: '6px 14px', border: '1px solid #dce1ff', borderRadius: 4, background: '#f4f3fa' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>qr_code</span>
            View Library Page
          </a>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 24px', border: '1px solid #00236f', color: '#00236f', background: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
            Discard Changes
          </button>
          <button onClick={handleSave} style={{ padding: '10px 32px', background: '#00236f', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
            {saved ? '✓ Saved!' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
}
