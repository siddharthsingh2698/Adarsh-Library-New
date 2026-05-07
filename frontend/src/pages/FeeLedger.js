import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';
const MODES = { cash: 'payments', upi: 'contactless', bank: 'account_balance', waiver: 'volunteer' };

const label = (text, required) => (
  <label style={{ fontSize: 11, fontWeight: 700, color: '#757682', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
    {text}{required ? ' *' : ''}
  </label>
);

export default function FeeLedger() {
  const [fees, setFees]             = useState([]);
  const [summary, setSummary]       = useState({});
  const [outstanding, setOutstanding] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1 });
  const [tab, setTab]               = useState('transactions');
  const [loading, setLoading]       = useState(true);
  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7));

  // Payment modal state
  const [modal, setModal]           = useState(false);
  const [students, setStudents]     = useState([]);
  const [pendingFees, setPendingFees] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedFeeId, setSelectedFeeId]         = useState('');
  const [manualMode, setManualMode]               = useState(false);
  const [manualAmount, setManualAmount]           = useState('');
  const [manualDueDate, setManualDueDate]         = useState(new Date().toISOString().slice(0, 10));
  const [paymentMode, setPaymentMode]             = useState('cash');
  const [reference, setReference]                 = useState('');
  const [paidDate, setPaidDate]                   = useState(new Date().toISOString().slice(0, 10));
  const [studentSearch, setStudentSearch]         = useState('');
  const [modalLoading, setModalLoading]           = useState(false);

  const fetchFees = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const [feesRes, summaryRes, outRes] = await Promise.all([
        axios.get(`${API}/fees`, { params: { page, limit: 20, month: monthFilter } }),
        axios.get(`${API}/fees/summary`, { params: { month: monthFilter } }),
        axios.get(`${API}/fees/outstanding`),
      ]);
      setFees(feesRes.data.data);
      setPagination(feesRes.data.pagination);
      setSummary(summaryRes.data.data);
      setOutstanding(outRes.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [monthFilter]);

  useEffect(() => { fetchFees(1); }, [fetchFees]);

  // Load students when modal opens
  const openModal = async () => {
    setSelectedStudentId('');
    setSelectedFeeId('');
    setPendingFees([]);
    setManualMode(false);
    setManualAmount('');
    setManualDueDate(new Date().toISOString().slice(0, 10));
    setPaymentMode('cash');
    setReference('');
    setPaidDate(new Date().toISOString().slice(0, 10));
    setStudentSearch('');
    setModal(true);
    try {
      const { data } = await axios.get(`${API}/students`, { params: { limit: 200, status: 'active' } });
      setStudents(data.data || []);
    } catch (e) { setStudents([]); }
  };

  // When student is selected, load their pending fees
  const handleStudentSelect = async (studentId) => {
    setSelectedStudentId(studentId);
    setSelectedFeeId('');
    setManualMode(false);
    setManualAmount('');
    setPendingFees([]);
    if (!studentId) return;
    setModalLoading(true);
    try {
      const { data } = await axios.get(`${API}/fees`, {
        params: { student_id: studentId, status: 'pending', limit: 20 }
      });
      const fees = data.data || [];
      setPendingFees(fees);
      if (fees.length === 1) setSelectedFeeId(fees[0].id);
    } catch (e) { setPendingFees([]); }
    finally { setModalLoading(false); }
  };

  const handleRecord = async () => {
    if (!selectedStudentId) { alert('Select a student'); return; }

    try {
      if (manualMode) {
        // Create new fee record and mark as paid immediately
        if (!manualAmount || parseFloat(manualAmount) <= 0) { alert('Enter a valid amount'); return; }
        await axios.post(`${API}/fees`, {
          student_id: selectedStudentId,
          amount: parseFloat(manualAmount),
          due_date: manualDueDate,
          paid_date: paidDate,
          payment_mode: paymentMode,
          reference: reference || null,
          status: 'paid',
        });
      } else {
        if (!selectedFeeId) { alert('Select a fee to pay'); return; }
        await axios.put(`${API}/fees/${selectedFeeId}`, {
          status: 'paid',
          paid_date: paidDate,
          payment_mode: paymentMode,
          reference: reference || null,
        });
      }
      setModal(false);
      fetchFees(1);
    } catch (e) { alert(e.response?.data?.message || 'Failed'); }
  };

  // Quick mark paid from table row
  const handleMarkPaid = async (id) => {
    const date = prompt('Payment date (YYYY-MM-DD):', new Date().toISOString().slice(0, 10));
    if (!date) return;
    await axios.put(`${API}/fees/${id}`, { status: 'paid', paid_date: date, payment_mode: 'cash' });
    fetchFees(pagination.page);
  };

  const statusBadge = (status) => {
    const map = {
      paid:    { bg: '#adedd3', color: '#306d58' },
      pending: { bg: '#ffdad6', color: '#93000a' },
      overdue: { bg: '#ffdad6', color: '#93000a' },
      waived:  { bg: '#f1f0f7', color: '#757682' },
    };
    const s = map[status] || map.pending;
    return (
      <span style={{ ...s, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
        {status?.toUpperCase()}
      </span>
    );
  };

  const filteredStudents = students.filter(s =>
    !studentSearch ||
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.phone.includes(studentSearch)
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontFamily: 'Newsreader, serif', fontSize: 32, fontWeight: 600, color: '#00236f' }}>Financial Ledger</h2>
          <p style={{ color: '#444651', fontSize: 14, marginTop: 4 }}>Fee collections and payment tracking.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <input type="month" value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #e3e1e9', borderRadius: 4, fontSize: 13, outline: 'none' }} />
          <button onClick={openModal} style={{ padding: '8px 16px', background: '#00236f', color: 'white', border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
            Record Payment
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Collected', value: `₹${parseFloat(summary.collected || 0).toLocaleString('en-IN')}`, icon: 'account_balance_wallet', bg: '#adedd3', color: '#2b6954', tag: 'This Month' },
          { label: 'Pending Amount',  value: `₹${parseFloat(summary.pending  || 0).toLocaleString('en-IN')}`, icon: 'pending_actions',       bg: '#ffdad6', color: '#ba1a1a', tag: 'Critical' },
          { label: 'Total Records',   value: (parseInt(summary.paid_count || 0) + parseInt(summary.pending_count || 0)).toString(), icon: 'receipt_long', bg: '#dce1ff', color: '#00236f', tag: '' },
        ].map(({ label: lbl, value, icon, bg, color, tag }) => (
          <div key={lbl} style={{ background: 'white', border: '1px solid #e3e1e9', borderRadius: 4, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ background: bg, padding: 8, borderRadius: 4 }}>
                <span className="material-symbols-outlined" style={{ color }}>{icon}</span>
              </div>
              {tag && <span style={{ fontSize: 12, fontWeight: 700, color }}>{tag}</span>}
            </div>
            <div style={{ fontSize: 11, color: '#757682', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{lbl}</div>
            <div style={{ fontFamily: 'Newsreader, serif', fontSize: 36, fontWeight: 600, color, marginTop: 4 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ background: 'white', border: '1px solid #e3e1e9', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e3e1e9', padding: '0 24px' }}>
          {[['transactions', 'Recent Transactions'], ['outstanding', 'Outstanding Dues']].map(([key, lbl]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: '14px 24px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: tab === key ? 700 : 500,
              color: tab === key ? '#00236f' : '#757682',
              borderBottom: tab === key ? '2px solid #00236f' : '2px solid transparent',
              marginBottom: -1
            }}>{lbl}</button>
          ))}
        </div>

        {tab === 'transactions' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f4f3fa' }}>
                  {['Student', 'Receipt ID', 'Amount', 'Mode', 'Due Date', 'Status', 'Action'].map((h, i) => (
                    <th key={h} style={{ padding: '12px 24px', textAlign: i === 2 ? 'right' : i === 6 ? 'center' : 'left', fontSize: 12, fontWeight: 600, color: '#757682', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e3e1e9' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#757682' }}>Loading...</td></tr>
                ) : fees.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#757682' }}>No transactions found — assign a seat to auto-generate fees</td></tr>
                ) : fees.map(f => (
                  <tr key={f.id} style={{ borderTop: '1px solid #f4f3fa' }}>
                    <td style={{ padding: '14px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, background: '#dce1ff', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#00236f' }}>
                          {f.student_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{f.student_name}</div>
                          <div style={{ fontSize: 11, color: '#757682' }}>{f.slot_name || 'General'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 24px', fontSize: 12, color: '#757682', fontFamily: 'monospace' }}>
                      ALMS-{f.id?.slice(0, 8).toUpperCase()}
                    </td>
                    <td style={{ padding: '14px 24px', fontSize: 14, fontWeight: 700, textAlign: 'right' }}>
                      ₹{parseFloat(f.amount).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#444651' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#00236f' }}>{MODES[f.payment_mode] || 'payments'}</span>
                        {f.payment_mode || '—'}
                      </div>
                    </td>
                    <td style={{ padding: '14px 24px', fontSize: 12, color: '#757682', fontFamily: 'monospace' }}>
                      {f.due_date ? new Date(f.due_date).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td style={{ padding: '14px 24px' }}>{statusBadge(f.status)}</td>
                    <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                      {f.status !== 'paid' && (
                        <button onClick={() => handleMarkPaid(f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2b6954', fontSize: 12, fontWeight: 700 }}>
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'outstanding' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f4f3fa' }}>
                  {['Student', 'Phone', 'Due Count', 'Total Due', 'Oldest Due', 'Action'].map(h => (
                    <th key={h} style={{ padding: '12px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#757682', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e3e1e9' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {outstanding.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#2b6954', fontSize: 14 }}>🎉 No outstanding dues!</td></tr>
                ) : outstanding.map(o => (
                  <tr key={o.student_id} style={{ borderTop: '1px solid #f4f3fa' }}>
                    <td style={{ padding: '14px 24px', fontSize: 13, fontWeight: 700, color: '#00236f' }}>{o.name}</td>
                    <td style={{ padding: '14px 24px', fontSize: 13, color: '#757682' }}>{o.phone}</td>
                    <td style={{ padding: '14px 24px', fontSize: 13 }}>{o.due_count}</td>
                    <td style={{ padding: '14px 24px', fontSize: 14, fontWeight: 700, color: '#ba1a1a' }}>₹{parseFloat(o.total_due).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '14px 24px', fontSize: 12, color: '#757682', fontFamily: 'monospace' }}>
                      {new Date(o.oldest_due).toLocaleDateString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 24px' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#00236f', fontSize: 12, fontWeight: 700 }}>Send Reminder</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', borderRadius: 4, padding: 32, width: 480, maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h3 style={{ fontFamily: 'Newsreader, serif', fontSize: 22, color: '#00236f' }}>Record Payment</h3>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p style={{ fontSize: 12, color: '#757682', marginBottom: 24 }}>
              Select a student to see their pending fees from seat assignments.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Step 1 — Student */}
              <div>
                {label('1. Select Student', true)}
                <input
                  type="text"
                  placeholder="Search name or phone..."
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e3e1e9', borderRadius: '4px 4px 0 0', fontSize: 13, outline: 'none', borderBottom: 'none' }}
                />
                <select
                  value={selectedStudentId}
                  onChange={e => handleStudentSelect(e.target.value)}
                  size={4}
                  style={{ width: '100%', border: '1px solid #e3e1e9', borderRadius: '0 0 4px 4px', fontSize: 13, outline: 'none', display: 'block' }}
                >
                  <option value="">— pick a student —</option>
                  {filteredStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.name} — {s.phone}</option>
                  ))}
                </select>
              </div>

              {/* Step 2 — Pending fee */}
              {selectedStudentId && (
                <div>
                  {label('2. Select Fee to Pay', true)}
                  {modalLoading ? (
                    <div style={{ padding: '10px 12px', border: '1px solid #e3e1e9', borderRadius: 4, fontSize: 13, color: '#757682' }}>Loading fees...</div>
                  ) : (
                    <>
                      {/* Existing pending fees */}
                      {!manualMode && pendingFees.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                          {pendingFees.map(f => (
                            <div
                              key={f.id}
                              onClick={() => setSelectedFeeId(f.id)}
                              style={{
                                padding: '12px 14px', border: `2px solid ${selectedFeeId === f.id ? '#00236f' : '#e3e1e9'}`,
                                borderRadius: 6, cursor: 'pointer',
                                background: selectedFeeId === f.id ? '#f0f4ff' : 'white',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                transition: 'all 0.15s'
                              }}
                            >
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 14, color: '#00236f' }}>
                                  ₹{parseFloat(f.amount).toLocaleString('en-IN')}
                                </div>
                                <div style={{ fontSize: 12, color: '#757682', marginTop: 2 }}>
                                  {f.slot_name || 'General'} · Due {new Date(f.due_date).toLocaleDateString('en-IN')}
                                </div>
                              </div>
                              <div style={{
                                width: 20, height: 20, borderRadius: '50%',
                                border: `2px solid ${selectedFeeId === f.id ? '#00236f' : '#c5c5d3'}`,
                                background: selectedFeeId === f.id ? '#00236f' : 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                              }}>
                                {selectedFeeId === f.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {!manualMode && pendingFees.length === 0 && (
                        <div style={{ padding: '10px 12px', border: '1px solid #adedd3', borderRadius: 4, fontSize: 13, color: '#2b6954', background: '#f0fdf4', marginBottom: 10 }}>
                          ✓ No pending fees for this student
                        </div>
                      )}

                      {/* Manual entry toggle */}
                      <button
                        onClick={() => { setManualMode(m => !m); setSelectedFeeId(''); }}
                        style={{
                          width: '100%', padding: '9px', border: `2px dashed ${manualMode ? '#00236f' : '#c5c5d3'}`,
                          borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700,
                          color: manualMode ? '#00236f' : '#757682',
                          background: manualMode ? '#f0f4ff' : 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                          {manualMode ? 'check_circle' : 'edit'}
                        </span>
                        {manualMode ? 'Manual Entry Selected' : 'Enter Amount Manually'}
                      </button>

                      {/* Manual fields */}
                      {manualMode && (
                        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 12, padding: 14, background: '#f4f3fa', borderRadius: 6, border: '1px solid #e3e1e9' }}>
                          <div>
                            <label style={{ fontSize: 11, fontWeight: 700, color: '#757682', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Amount (₹) *</label>
                            <input
                              type="number"
                              value={manualAmount}
                              onChange={e => setManualAmount(e.target.value)}
                              placeholder="e.g. 800"
                              style={{ width: '100%', padding: '8px 12px', border: '1px solid #e3e1e9', borderRadius: 4, fontSize: 14, fontWeight: 700, outline: 'none' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: 11, fontWeight: 700, color: '#757682', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Due Date</label>
                            <input
                              type="date"
                              value={manualDueDate}
                              onChange={e => setManualDueDate(e.target.value)}
                              style={{ width: '100%', padding: '8px 12px', border: '1px solid #e3e1e9', borderRadius: 4, fontSize: 13, outline: 'none' }}
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Step 3 — Payment details */}
              {(selectedFeeId || manualMode) && (
                <>
                  <div>
                    {label('3. Payment Mode', true)}
                    <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #e3e1e9', borderRadius: 4, fontSize: 13, outline: 'none' }}>
                      <option value="cash">Cash</option>
                      <option value="upi">UPI</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="waiver">Waiver</option>
                    </select>
                  </div>
                  <div>
                    {label('Payment Date', true)}
                    <input type="date" value={paidDate} onChange={e => setPaidDate(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #e3e1e9', borderRadius: 4, fontSize: 13, outline: 'none' }} />
                  </div>
                  {(paymentMode === 'upi' || paymentMode === 'bank') && (
                    <div>
                      {label('Reference / Transaction ID')}
                      <input type="text" value={reference} onChange={e => setReference(e.target.value)}
                        placeholder="UPI ref or bank txn ID"
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #e3e1e9', borderRadius: 4, fontSize: 13, outline: 'none' }} />
                    </div>
                  )}
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button onClick={() => setModal(false)} style={{ flex: 1, padding: 10, border: '1px solid #e3e1e9', background: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                Cancel
              </button>
              <button
                onClick={handleRecord}
                disabled={!selectedStudentId || (!selectedFeeId && !manualMode)}
                style={{ flex: 1, padding: 10, background: (selectedFeeId || manualMode) ? '#00236f' : '#c5c5d3', color: 'white', border: 'none', borderRadius: 4, cursor: (selectedFeeId || manualMode) ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 700 }}
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
