import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

export default function Students() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [slots, setSlots] = useState([]);
  const [slotFilter, setSlotFilter] = useState('');

  const fetchStudents = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (slotFilter) params.slot_id = slotFilter;
      const { data } = await axios.get(`${API}/students`, { params });
      setStudents(data.data);
      setPagination(data.pagination);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search, statusFilter, slotFilter]);

  useEffect(() => { fetchStudents(1); }, [fetchStudents]);

  useEffect(() => {
    axios.get(`${API}/slots`).then(r => setSlots(r.data.data)).catch(() => {});
  }, []);

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this student?')) return;
    await axios.delete(`${API}/students/${id}`);
    fetchStudents(pagination.page);
  };

  const feeStatusBadge = (status) => {
    const styles = {
      paid: { background: '#adedd3', color: '#306d58' },
      pending: { background: '#ffdad6', color: '#93000a' },
      overdue: { background: '#ffdad6', color: '#93000a' },
    };
    const s = styles[status] || { background: '#f1f0f7', color: '#757682' };
    return (
      <span style={{ ...s, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
        {(status || 'CLEAR').toUpperCase()}
      </span>
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontFamily: 'Newsreader, serif', fontSize: 40, fontWeight: 600, color: '#00236f' }}>Student Directory</h2>
          <p style={{ color: '#444651', fontSize: 14, marginTop: 4 }}>Manage and monitor institutional member access and enrollment status.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button style={{ padding: '8px 16px', border: '1px solid #00236f', color: '#00236f', background: 'none', borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
            Export List
          </button>
          <button onClick={() => navigate('/students/add')} style={{ padding: '8px 16px', background: '#00236f', color: 'white', border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person_add</span>
            Register Student
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Students', value: pagination.total, icon: 'groups', color: '#00236f', bg: '#dce1ff' },
          { label: 'Active Members', value: students.filter(s => s.status === 'active').length, icon: 'check_circle', color: '#2b6954', bg: '#adedd3' },
          { label: 'Dues Pending', value: students.filter(s => s.fee_status === 'pending' || s.fee_status === 'overdue').length, icon: 'pending_actions', color: '#c05c00', bg: '#ffdbcb' },
          { label: 'This Page', value: students.length, icon: 'event_seat', color: '#444651', bg: '#f1f0f7' },
        ].map(({ label, value, icon, color, bg }) => (
          <div key={label} style={{ background: 'white', border: '1px solid #e3e1e9', borderRadius: 4, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, background: bg, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ color, fontSize: 22 }}>{icon}</span>
            </div>
            <div>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#757682', fontWeight: 700 }}>{label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color, fontFamily: 'Newsreader, serif' }}>{value?.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: 'white', border: '1px solid #e3e1e9', borderRadius: '4px 4px 0 0', padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['', 'All Students'], ['active', 'Active'], ['inactive', 'Inactive']].map(([val, label]) => (
            <button key={val} onClick={() => setStatusFilter(val)} style={{
              padding: '6px 16px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
              background: statusFilter === val ? '#00236f' : 'transparent',
              color: statusFilter === val ? 'white' : '#444651'
            }}>{label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, phone, email..."
            style={{ padding: '6px 12px', border: '1px solid #e3e1e9', borderRadius: 4, fontSize: 13, width: 220, outline: 'none' }}
          />
          <select value={slotFilter} onChange={e => setSlotFilter(e.target.value)} style={{ padding: '6px 12px', border: '1px solid #e3e1e9', borderRadius: 4, fontSize: 12, color: '#444651', outline: 'none' }}>
            <option value="">All Slots</option>
            {slots.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'white', border: '1px solid #e3e1e9', borderTop: 'none', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f4f3fa' }}>
              {['Student Name', 'ID Number', 'Slot', 'Seat No.', 'Fee Status', 'Actions'].map((h, i) => (
                <th key={h} style={{ padding: '12px 24px', textAlign: i === 4 ? 'center' : i === 5 ? 'right' : 'left', fontSize: 12, fontWeight: 600, color: '#757682', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e3e1e9' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#757682' }}>Loading...</td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#757682' }}>No students found</td></tr>
            ) : students.map((s, i) => (
              <tr key={s.id} style={{ borderTop: '1px solid #f4f3fa', background: i % 2 === 1 ? '#fafafa' : 'white' }}>
                <td style={{ padding: '14px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%', background: '#dce1ff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, color: '#00236f', flexShrink: 0
                    }}>
                      {s.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#00236f' }}>{s.name}</div>
                      <div style={{ fontSize: 10, color: '#757682' }}>Joined {new Date(s.joined_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 24px', fontSize: 13, color: '#757682', fontFamily: 'monospace' }}>
                  ALMS-{s.id?.slice(0, 8).toUpperCase()}
                </td>
                <td style={{ padding: '14px 24px' }}>
                  {s.slot_name ? (
                    <span style={{ background: '#dce1ff', color: '#00236f', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                      {s.slot_name}
                    </span>
                  ) : <span style={{ color: '#c5c5d3', fontSize: 12 }}>—</span>}
                </td>
                <td style={{ padding: '14px 24px' }}>
                  {s.seat_number ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2b6954' }} />
                      <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{s.seat_number}</span>
                    </div>
                  ) : <span style={{ color: '#c5c5d3', fontSize: 12 }}>Unassigned</span>}
                </td>
                <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                  {feeStatusBadge(s.fee_status)}
                </td>
                <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                    <button onClick={() => navigate(`/students/${s.id}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#00236f' }}>View Profile</button>
                    <span style={{ color: '#c5c5d3' }}>|</span>
                    <button onClick={() => handleDeactivate(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#ba1a1a' }}>Deactivate</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ background: 'white', border: '1px solid #e3e1e9', borderTop: 'none', borderRadius: '0 0 4px 4px', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 13, color: '#757682' }}>
          Showing <strong>{students.length}</strong> of <strong>{pagination.total}</strong> students
        </p>
        <div style={{ display: 'flex', gap: 4 }}>
          <button disabled={pagination.page <= 1} onClick={() => fetchStudents(pagination.page - 1)} style={{ padding: '6px 10px', border: '1px solid #e3e1e9', background: 'white', borderRadius: 4, cursor: 'pointer', color: '#444651' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
          </button>
          {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => fetchStudents(p)} style={{
              width: 32, height: 32, border: '1px solid #e3e1e9', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 600,
              background: pagination.page === p ? '#00236f' : 'white',
              color: pagination.page === p ? 'white' : '#444651'
            }}>{p}</button>
          ))}
          <button disabled={pagination.page >= pagination.pages} onClick={() => fetchStudents(pagination.page + 1)} style={{ padding: '6px 10px', border: '1px solid #e3e1e9', background: 'white', borderRadius: 4, cursor: 'pointer', color: '#444651' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}
