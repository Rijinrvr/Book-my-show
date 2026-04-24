'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Film, LogOut, User, LayoutDashboard, Shield, Ticket, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    router.push('/');
  };

  const close = () => setMenuOpen(false);

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <nav className="navbar" style={{ position: 'sticky', top: 0, zIndex: 200 }}>
        <Link href="/" className="navbar-logo" onClick={close}>
          🎬 BookMyShow
        </Link>

        {/* ── Desktop links ── */}
        <div className="navbar-links" id="desktop-nav">
          {user ? (
            <>
              <Link href="/movies" className={`btn-ghost${isActive('/movies') ? ' nav-active' : ''}`}>
                <Film size={16} /> Movies
              </Link>

              {user.role === 'admin' ? (
                <Link href="/admin" className={`btn-ghost${isActive('/admin') ? ' nav-active' : ''}`}>
                  <Shield size={16} /> Admin
                </Link>
              ) : (
                <>
                  <Link href="/dashboard" className={`btn-ghost${isActive('/dashboard') ? ' nav-active' : ''}`}>
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <Link href="/bookings" className={`btn-ghost${isActive('/bookings') ? ' nav-active' : ''}`}>
                    <Ticket size={16} /> My Bookings
                  </Link>
                </>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
                <User size={14} />
                <span className="user-name-label">{user.name}</span>
              </div>
              <button onClick={handleLogout} className="btn-ghost">
                <LogOut size={16} />
                <span className="logout-label">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-secondary" style={{ padding: '8px 20px' }}>Login</Link>
              <Link href="/register" className="btn-primary" style={{ padding: '8px 20px' }}>Sign Up</Link>
            </>
          )}
        </div>

        {/* ── Hamburger button (mobile only) ── */}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="hamburger-btn"
          aria-label="Toggle menu"
          style={{
            display: 'none',
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '7px',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* ── Mobile drawer ── */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 190,
          }}
          onClick={close}
        >
          {/* Backdrop */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />

          {/* Drawer panel */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: '60px',
              left: 0,
              right: 0,
              background: '#0a0a0f',
              borderBottom: '1px solid var(--border)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              maxHeight: 'calc(100vh - 60px)',
              overflowY: 'auto'
            }}
          >
            {user ? (
              <>
                {/* User pill */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', marginBottom: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(229,9,20,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={18} color="var(--accent-red)" />
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <p style={{ fontSize: '15px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
                  </div>
                </div>

                <Link href="/movies" className="mobile-nav-item" onClick={close} style={navItemStyle(isActive('/movies'))}>
                  <Film size={18} /> Movies
                </Link>

                {user.role === 'admin' ? (
                  <Link href="/admin" className="mobile-nav-item" onClick={close} style={navItemStyle(isActive('/admin'))}>
                    <Shield size={18} /> Admin Panel
                  </Link>
                ) : (
                  <>
                    <Link href="/dashboard" className="mobile-nav-item" onClick={close} style={navItemStyle(isActive('/dashboard'))}>
                      <LayoutDashboard size={18} /> Dashboard
                    </Link>
                    <Link href="/bookings" className="mobile-nav-item" onClick={close} style={navItemStyle(isActive('/bookings'))}>
                      <Ticket size={18} /> My Bookings
                    </Link>
                  </>
                )}

                <div style={{ height: '1px', background: 'var(--border)', margin: '12px 0' }} />

                <button
                  onClick={handleLogout}
                  style={{ ...navItemStyle(false), color: '#ef4444', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer', width: '100%', textAlign: 'left' }}
                >
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '10px' }}>
                <Link href="/login" onClick={close} className="btn-secondary" style={{ justifyContent: 'center', padding: '14px' }}>Login</Link>
                <Link href="/register" onClick={close} className="btn-primary" style={{ justifyContent: 'center', padding: '14px' }}>Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inline styles for responsive navbar behaviour */}
      <style>{`
        .nav-active {
          color: var(--accent-red) !important;
          background: rgba(229,9,20,0.08) !important;
          border-radius: 8px;
        }
        @media (max-width: 768px) {
          #desktop-nav { display: none !important; }
          .hamburger-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}

function navItemStyle(active: boolean): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: 500,
    color: active ? 'var(--accent-red)' : 'var(--text-primary)',
    background: active ? 'rgba(229,9,20,0.08)' : 'transparent',
    border: active ? '1px solid rgba(229,9,20,0.2)' : '1px solid transparent',
    transition: 'all 0.15s',
  };
}
