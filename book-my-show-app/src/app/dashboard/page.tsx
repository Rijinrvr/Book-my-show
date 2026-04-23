'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import MovieCard from '@/components/MovieCard';
import { Movie, BookingWithDetails } from '@/lib/types';
import { Ticket, Star, TrendingUp, Clock, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [moviesLoading, setMoviesLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (!loading && user?.role === 'admin') router.push('/admin');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch('/api/movies').then((r) => r.json()),
      fetch('/api/bookings').then((r) => r.json()),
    ]).then(([moviesData, bookingsData]) => {
      setMovies(moviesData);
      setBookings(bookingsData);
      setMoviesLoading(false);
    });
  }, [user]);

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      {/* Hero welcome */}
      <div style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a0a12 100%)', padding: '48px 0 36px', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '6px' }}>
                Hello, {user.name.split(' ')[0]} 👋
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>Discover and book your next cinema experience</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div className="stat-card" style={{ padding: '16px 24px', textAlign: 'center', minWidth: '100px' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-red)' }}>{bookings.length}</div>
                <div className="stat-label">Bookings</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px' }}>
        {/* Recent bookings */}
        {bookings.length > 0 && (
          <div style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h2 className="section-title" style={{ marginBottom: '2px' }}>My Bookings</h2>
                <p className="section-subtitle" style={{ marginBottom: 0 }}>Your recent ticket reservations</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {bookings.slice(0, 3).map((booking) => (
                <Link key={booking.id} href={`/bookings/${booking.id}`} style={{ textDecoration: 'none' }}>
                  <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(229,9,20,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Ticket size={20} color="var(--accent-red)" />
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '15px' }}>{booking.movie?.title || 'Movie'}</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                          {booking.theater?.name} • {booking.show?.date} {booking.show?.time}
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
                          Seats: {booking.seats.join(', ')}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 700, color: 'var(--accent-red)', fontSize: '16px' }}>₹{booking.totalAmount}</p>
                      <span className="badge badge-green">{booking.paymentStatus}</span>
                      <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px' }}>#{booking.bookingRef}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Movies Grid */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <TrendingUp size={20} color="var(--accent-red)" />
              <h2 className="section-title" style={{ marginBottom: 0 }}>Now Showing</h2>
            </div>
            <Link href="/movies" style={{ color: 'var(--accent-red)', fontSize: '14px', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <p className="section-subtitle">Book tickets for the latest blockbusters</p>

          {moviesLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
              <div className="spinner" />
            </div>
          ) : (
            <div className="movies-grid">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
