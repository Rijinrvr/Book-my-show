'use client';

import { useEffect, useState } from 'react';
import { Users, Film, Building2, Calendar, Ticket, TrendingUp, DollarSign } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalMovies: number;
  totalTheaters: number;
  totalShows: number;
  totalBookings: number;
  totalRevenue: number;
  recentBookings: Array<{
    id: string;
    userName: string;
    bookingRef: string;
    totalAmount: number;
    seats: string[];
    bookingDate: string;
    paymentStatus: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((data) => {
        if (data) setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: <Users size={22} />, color: '#3b82f6' },
    { label: 'Movies', value: stats.totalMovies, icon: <Film size={22} />, color: 'var(--accent-red)' },
    { label: 'Theaters', value: stats.totalTheaters, icon: <Building2 size={22} />, color: '#8b5cf6' },
    { label: 'Shows', value: stats.totalShows, icon: <Calendar size={22} />, color: '#f59e0b' },
    { label: 'Bookings', value: stats.totalBookings, icon: <Ticket size={22} />, color: '#22c55e' },
    { label: 'Revenue', value: `₹${(stats.totalRevenue ?? 0).toLocaleString()}`, icon: <TrendingUp size={22} />, color: '#ec4899' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="section-title">Admin Dashboard</h1>
        <p className="section-subtitle" style={{ marginBottom: 0 }}>Overview of your cinema booking platform</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        {statCards.map(({ label, value, icon, color }) => (
          <div key={label} className="stat-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
              {icon}
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Recent Bookings</h2>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
          {stats.recentBookings.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No bookings yet.
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Booking Ref</th>
                  <th>User</th>
                  <th>Seats</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentBookings.map((b) => (
                  <tr key={b.id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--accent-red)' }}>#{b.bookingRef}</td>
                    <td>{b.userName}</td>
                    <td>{b.seats.join(', ')}</td>
                    <td style={{ fontWeight: 700 }}>₹{b.totalAmount}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {new Date(b.bookingDate).toLocaleDateString('en-IN')}
                    </td>
                    <td>
                      <span className={`badge ${b.paymentStatus === 'confirmed' ? 'badge-green' : 'badge-gray'}`}>
                        {b.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
