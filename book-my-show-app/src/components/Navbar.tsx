'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Film, LogOut, User, LayoutDashboard, Shield, Ticket } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-logo">
        🎬 BookMyShow
      </Link>

      <div className="navbar-links">
        {user ? (
          <>
            <Link href="/movies" className="btn-ghost">
              <Film size={16} /> Movies
            </Link>

            {user.role === 'admin' ? (
              <Link href="/admin" className="btn-ghost">
                <Shield size={16} /> Admin
              </Link>
            ) : (
              <>
                <Link href="/dashboard" className="btn-ghost">
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                <Link href="/bookings" className="btn-ghost">
                  <Ticket size={16} /> My Bookings
                </Link>
              </>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
              <User size={14} />
              <span>{user.name}</span>
            </div>
            <button onClick={handleLogout} className="btn-ghost">
              <LogOut size={16} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="btn-secondary" style={{ padding: '8px 20px' }}>
              Login
            </Link>
            <Link href="/register" className="btn-primary" style={{ padding: '8px 20px' }}>
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
