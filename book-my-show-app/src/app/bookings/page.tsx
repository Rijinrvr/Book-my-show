'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { BookingWithDetails } from '@/lib/types';
import { Ticket, Calendar, MapPin, Clock, ArrowRight, Film } from 'lucide-react';

export default function BookingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    fetch('/api/bookings')
      .then((r) => r.json())
      .then((data) => {
        setBookings(Array.isArray(data) ? data : []);
        setBookingsLoading(false);
      });
  }, [user]);

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  const confirmed = bookings.filter((b) => b.paymentStatus === 'confirmed');
  const totalSpent = confirmed.reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      {/* Hero Header */}
      <div style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a0a12 100%)', padding: '48px 0 36px', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '6px' }}>My Bookings</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Your complete cinema ticket history
              </p>
            </div>
            {/* Stats row */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <div className="stat-card" style={{ padding: '16px 24px', textAlign: 'center', minWidth: '100px' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-red)' }}>{bookings.length}</div>
                <div className="stat-label">Total</div>
              </div>
              <div className="stat-card" style={{ padding: '16px 24px', textAlign: 'center', minWidth: '100px' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#22c55e' }}>{confirmed.length}</div>
                <div className="stat-label">Confirmed</div>
              </div>
              <div className="stat-card" style={{ padding: '16px 24px', textAlign: 'center', minWidth: '120px' }}>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#f59e0b' }}>₹{totalSpent.toLocaleString()}</div>
                <div className="stat-label">Spent</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px' }}>
        {bookingsLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
            <div className="spinner" />
          </div>
        ) : bookings.length === 0 ? (
          /* Empty state */
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-secondary)' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(229,9,20,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Ticket size={36} color="var(--accent-red)" style={{ opacity: 0.5 }} />
            </div>
            <p style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>No bookings yet</p>
            <p style={{ fontSize: '14px', marginBottom: '24px' }}>Your ticket reservations will appear here</p>
            <Link href="/movies" className="btn-primary" style={{ padding: '12px 28px' }}>
              <Film size={16} /> Browse Movies
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {bookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/bookings/${booking.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div
                  className="glass-card"
                  style={{ padding: '0', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(229,9,20,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  {/* Red left accent bar */}
                  <div style={{ display: 'flex' }}>
                    <div style={{ width: '4px', background: booking.paymentStatus === 'confirmed' ? 'var(--accent-red)' : 'var(--border)', flexShrink: 0 }} />

                    <div style={{ flex: 1, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                      {/* Left: icon + details */}
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{
                          width: '52px', height: '52px', borderRadius: '12px',
                          background: 'rgba(229,9,20,0.08)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <Ticket size={22} color="var(--accent-red)" />
                        </div>

                        <div>
                          <p style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px', color: 'var(--text-primary)' }}>
                            {booking.movie?.title || 'Movie'}
                          </p>

                          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-secondary)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={12} /> {booking.theater?.name || '—'}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={12} /> {booking.show?.date || '—'}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={12} /> {booking.show?.time || '—'}
                            </span>
                          </div>

                          <div style={{ marginTop: '6px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {booking.seats.map((s) => (
                              <span key={s} className="badge badge-gray" style={{ fontSize: '11px' }}>{s}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right: amount + status + ref + arrow */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontWeight: 800, fontSize: '20px', color: 'var(--accent-red)' }}>
                            ₹{booking.totalAmount}
                          </p>
                          <span className={`badge ${booking.paymentStatus === 'confirmed' ? 'badge-green' : 'badge-gray'}`} style={{ fontSize: '11px' }}>
                            {booking.paymentStatus === 'confirmed' ? '✓ Confirmed' : booking.paymentStatus}
                          </span>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                            #{booking.bookingRef}
                          </p>
                        </div>
                        <ArrowRight size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
