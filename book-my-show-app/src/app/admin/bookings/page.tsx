'use client';

import { useEffect, useState } from 'react';
import { BookingWithDetails } from '@/lib/types';
import { Ticket } from 'lucide-react';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/bookings')
      .then((r) => r.json())
      .then((data) => { setBookings(data); setLoading(false); });
  }, []);

  const totalRevenue = bookings.filter((b) => b.paymentStatus === 'confirmed').reduce((s, b) => s + b.totalAmount, 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="section-title" style={{ marginBottom: '4px' }}>Bookings</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            {bookings.length} booking(s) • Total Revenue: <strong style={{ color: 'var(--accent-red)' }}>₹{totalRevenue.toLocaleString()}</strong>
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" /></div>
      ) : bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
          <Ticket size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p>No bookings yet.</p>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ref</th>
                <th>User</th>
                <th>Movie</th>
                <th>Theater</th>
                <th>Show</th>
                <th>Seats</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--accent-red)', fontWeight: 700 }}>#{b.bookingRef}</td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{b.userName}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>{b.userEmail}</div>
                  </td>
                  <td style={{ fontWeight: 600, fontSize: '13px' }}>{b.movie?.title || '—'}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{b.theater?.name || '—'}</td>
                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{b.show?.date} {b.show?.time}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {b.seats.map((s) => <span key={s} className="badge badge-red" style={{ fontSize: '10px' }}>{s}</span>)}
                    </div>
                  </td>
                  <td style={{ fontWeight: 700 }}>₹{b.totalAmount}</td>
                  <td>
                    <span className={`badge ${b.paymentStatus === 'confirmed' ? 'badge-green' : 'badge-gray'}`}>
                      {b.paymentStatus}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {new Date(b.bookingDate).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
