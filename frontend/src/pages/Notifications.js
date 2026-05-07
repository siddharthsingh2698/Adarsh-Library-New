import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const TYPE_COLORS = {
  fee_reminder: { bg: '#ffdbcb', color: '#773205' },
  overdue: { bg: '#ffdad6', color: '#93000a' },
  slot_expiry: { bg: '#dce1ff', color: '#264191' },
  broadcast: { bg: '#adedd3', color: '#306d58' },
  seat_alarm: { bg: '#ffdad6', color: '#93000a' },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [broadcastModal, setBroadcastModal] = useState(false);
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState('email');

  useEffect(() => {
    axios.get(`${API}/notifications`).then(r => setNotifications(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleBroadcast = async () => {
    if (!message.trim()) return;
    try {
      await axios.post(`${API}/notifications/broadcast`, { message, channel });
      setBroadcastModal(false);
      setMessage('');
      const r = await axios.get(`${API}/notifications`);
      setNotifications(r.data.data);
    } catch (e) { alert('Broadcast failed'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontFamily: 'Newsreader, serif', fontSize: 32, fontWeight: 600, color: '#00236f' }}>Notifications</h2>
          <p style={{ color: '#444651', fontSize: 14, marginTop: 4 }}>Automated reminders, alerts, and broadcast messages.</p>
        </div>
        <button onClick={() => setBroadcastModal(true)} style={{ padding: '8px 16px', background: '#00236f', color: 'white', border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>campaign</span>
          Broadcast Message
        </button>
      </div>

      <div style={{ background: 'white', border: '1px solid #e3e1e9', borderRadius: 4, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f4f3fa' }}>
              {['Type', 'Student', 'Channel', 'Message', 'Sent At', 'Status'].map(h => (
                <th key={h} style={{ padding: '12px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#757682', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e3e1e9' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#757682' }}>Loading...</td></tr>
            ) : notifications.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#757682' }}>No notifications yet</td></tr>
            ) : notifications.map(n => {
              const tc = TYPE_COLORS[n.type] || { bg: '#f1f0f7', color: '#757682' };
              return (
                <tr key={n.id} style={{ borderTop: '1px solid #f4f3fa' }}>
                  <td style={{ padding: '12px 24px' }}>
                    <span style={{ ...tc, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                      {n.type?.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '12px 24px', fontSize: 13, color: '#00236f', fontWeight: 600 }}>{n.student_name || 'All Students'}</td>
                  <td style={{ padding: '12px 24px', fontSize: 12, color: '#757682', textTransform: 'uppercase' }}>{n.channel}</td>
                  <td style={{ padding: '12px 24px', fontSize: 13, color: '#444651', maxWidth: 300 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.message}</div>
                  </td>
                  <td style={{ padding: '12px 24px', fontSize: 12, color: '#757682', fontFamily: 'monospace' }}>
                    {new Date(n.sent_at).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '12px 24px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                      background: n.status === 'sent' ? '#adedd3' : n.status === 'failed' ? '#ffdad6' : '#f1f0f7',
                      color: n.status === 'sent' ? '#306d58' : n.status === 'failed' ? '#93000a' : '#757682'
                    }}>{n.status?.toUpperCase()}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {broadcastModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', borderRadius: 4, padding: 32, width: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'Newsreader, serif', fontSize: 22, color: '#00236f' }}>Broadcast Message</h3>
              <button onClick={() => setBroadcastModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#757682', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Channel</label>
                <select value={channel} onChange={e => setChannel(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e3e1e9', borderRadius: 4, fontSize: 13, outline: 'none' }}>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#757682', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Message *</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} placeholder="Type your message to all active students..." style={{ width: '100%', padding: '8px 12px', border: '1px solid #e3e1e9', borderRadius: 4, fontSize: 13, outline: 'none', resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button onClick={() => setBroadcastModal(false)} style={{ flex: 1, padding: 10, border: '1px solid #e3e1e9', background: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Cancel</button>
              <button onClick={handleBroadcast} style={{ flex: 1, padding: 10, background: '#00236f', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Send Broadcast</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
