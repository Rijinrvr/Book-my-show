'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Film, Building2, Calendar, Ticket, BarChart3, LogOut, Users, ChevronRight } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (!loading && user && user.role !== 'admin') router.push('/dashboard');
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: <BarChart3 size={18} /> },
    { href: '/admin/movies', label: 'Movies', icon: <Film size={18} /> },
    { href: '/admin/theaters', label: 'Theaters', icon: <Building2 size={18} /> },
    { href: '/admin/shows', label: 'Shows', icon: <Calendar size={18} /> },
    { href: '/admin/bookings', label: 'Bookings', icon: <Ticket size={18} /> },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <div className="sidebar" style={{ position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50, display: 'flex', flexDirection: 'column' }}>
        {/* Logo */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '18px', fontWeight: 800, background: 'linear-gradient(135deg, var(--accent-red), #ff6b7a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              🎬 BookMyShow
            </div>
          </Link>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Admin Panel
          </div>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '8px 0' }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-item ${pathname === item.href ? 'active' : ''}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700 }}>
              {user.name[0]}
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>{user.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Administrator</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 0' }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: '240px', minWidth: 0 }}>
        {/* Top Bar */}
        <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <span>Admin</span>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--text-primary)' }}>
            {navItems.find((n) => n.href === pathname)?.label || 'Panel'}
          </span>
        </div>
        <div style={{ padding: '32px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
