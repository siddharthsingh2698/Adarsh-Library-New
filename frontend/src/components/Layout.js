import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard',     icon: 'dashboard',      label: 'Dashboard' },
  { to: '/seats',         icon: 'grid_view',      label: 'Seat Map' },
  { to: '/students',      icon: 'group',          label: 'Student Directory' },
  { to: '/checkin',       icon: 'login',          label: 'Check-In' },
  { to: '/fees',          icon: 'payments',       label: 'Fee Ledger' },
  { to: '/notifications', icon: 'notifications',  label: 'Notifications' },
  { to: '/reports',       icon: 'bar_chart',      label: 'Reports' },
  { to: '/config',        icon: 'settings',       label: 'Configuration' },
];

export default function Layout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 256, minHeight: '100vh', background: '#f1f0f7',
        borderRight: '1px solid #e3e1e9', display: 'flex', flexDirection: 'column',
        padding: '24px 0', position: 'fixed', top: 0, left: 0, zIndex: 50
      }}>
        <div style={{ padding: '0 24px', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, background: '#00236f', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ color: 'white', fontSize: 20 }}>account_balance</span>
            </div>
            <div>
              <div style={{ fontFamily: 'Newsreader, serif', fontWeight: 900, fontSize: 15, color: '#00236f', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
                Adarsh Library
              </div>
              <div style={{ fontSize: 9, color: '#757682', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
                Institutional Archive
              </div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '0 8px' }}>
          {navItems.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 16px', borderRadius: 2, textDecoration: 'none',
              fontSize: 14, fontFamily: 'Newsreader, serif', fontWeight: isActive ? 700 : 500,
              color: isActive ? '#00236f' : '#444651',
              background: isActive ? 'white' : 'transparent',
              borderLeft: isActive ? '4px solid #00236f' : '4px solid transparent',
              transition: 'all 0.15s'
            })}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '16px 8px 0', borderTop: '1px solid #e3e1e9', marginTop: 8 }}>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 16px', width: '100%', background: 'none', border: 'none',
            cursor: 'pointer', fontSize: 14, fontFamily: 'Newsreader, serif', fontWeight: 500,
            color: '#444651', borderRadius: 2
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ marginLeft: 256, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          height: 64, background: 'white', borderBottom: '1px solid #e3e1e9',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', position: 'sticky', top: 0, zIndex: 40
        }}>
          <div style={{ position: 'relative', width: 360 }}>
            <span className="material-symbols-outlined" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#757682', fontSize: 18 }}>search</span>
            <input placeholder="Search students, seats, fees..." style={{ width: '100%', padding: '8px 12px 8px 36px', background: '#f4f3fa', border: '1px solid #e3e1e9', borderRadius: 4, fontSize: 13, fontFamily: 'Newsreader, serif', fontStyle: 'italic', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>
              <span className="material-symbols-outlined" style={{ color: '#757682' }}>notifications</span>
            </button>
            <div style={{ width: 1, height: 32, background: '#e3e1e9' }} />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#00236f' }}>{admin?.name || 'Admin'}</div>
              <div style={{ fontSize: 10, color: '#757682', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Super Administrator</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#dce1ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#00236f' }}>
              {(admin?.name || 'A')[0].toUpperCase()}
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: 32, maxWidth: 1400, width: '100%', margin: '0 auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
