'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Show, Movie, Theater } from '@/lib/types';
import { MapPin, Clock, Calendar, Ticket, Info, AlertCircle, CheckCircle } from 'lucide-react';

interface ShowWithDetails extends Show {
  movie: Movie;
  theater: Theater;
}

export default function SeatSelectionPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [show, setShow] = useState<ShowWithDetails | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/shows/${id}`)
      .then((r) => r.json())
      .then(async (showData) => {
        const [movieRes, theaterRes] = await Promise.all([
          fetch(`/api/movies/${showData.movieId}`),
          fetch(`/api/theaters/${showData.theaterId}`),
        ]);
        const movie = await movieRes.json();
        const theater = await theaterRes.json();
        setShow({ ...showData, movie, theater });
        setPageLoading(false);
      });
  }, [id, user]);

  if (loading || !user || pageLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!show) return null;

  const { theater, movie } = show;

  const toggleSeat = (seatId: string) => {
    if (show.bookedSeats.includes(seatId)) return;
    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((s) => s !== seatId) : [...prev, seatId]
    );
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat.');
      return;
    }
    setError('');
    setBooking(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showId: id, seats: selectedSeats }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Booking failed. Please try again.');
        setBooking(false);
        return;
      }
      router.push(`/bookings/${data.id}?success=true`);
    } catch {
      setError('An unexpected error occurred.');
      setBooking(false);
    }
  };

  const totalAmount = selectedSeats.length * show.price;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      <div className="container" style={{ padding: '24px 0' }}>
        {/* Show Info Header */}
        <div className="glass-card mobile-stack" style={{ padding: '20px 24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center' }}>
          <div style={{ width: '100%' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '6px' }}>{movie?.title}</h1>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: '13px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                <MapPin size={13} /> {theater?.name}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                <Calendar size={13} /> {show.date}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                <Clock size={13} /> {show.time}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'flex-start' }}>
            <span className="badge badge-gray">{show.format}</span>
            <span className="badge badge-gray">{show.language}</span>
            <span className="badge badge-red">₹{show.price}/seat</span>
          </div>
        </div>

        {/* Screen */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-block',
            width: '80%',
            maxWidth: '600px',
            height: '8px',
            background: 'linear-gradient(90deg, transparent, rgba(229,9,20,0.5), rgba(255,255,255,0.3), rgba(229,9,20,0.5), transparent)',
            borderRadius: '50%',
            boxShadow: '0 4px 30px rgba(229,9,20,0.3), 0 0 60px rgba(255,255,255,0.1)',
            marginBottom: '8px',
          }} />
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '3px', textTransform: 'uppercase' }}>Screen</p>
        </div>

        {/* Seat Grid */}
        <div style={{ overflowX: 'auto', marginBottom: '32px' }}>
          <div style={{ display: 'inline-block', minWidth: 'max-content', margin: '0 auto' }}>
            {theater?.rows?.map((row) => (
              <div key={row} style={{ display: 'flex', gap: '6px', marginBottom: '6px', alignItems: 'center' }}>
                <div style={{ width: '20px', textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, marginRight: '8px', flexShrink: 0 }}>
                  {row}
                </div>
                {Array.from({ length: theater.seatsPerRow }, (_, i) => {
                  const seatId = `${row}${i + 1}`;
                  const isBooked = show.bookedSeats.includes(seatId);
                  const isSelected = selectedSeats.includes(seatId);
                  return (
                    <button
                      key={seatId}
                      className={`seat ${isBooked ? 'seat-booked' : isSelected ? 'seat-selected' : 'seat-available'}`}
                      onClick={() => toggleSeat(seatId)}
                      disabled={isBooked}
                      title={seatId}
                      style={{ fontSize: '9px' }}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {[
            { cls: 'seat seat-available', label: 'Available' },
            { cls: 'seat seat-selected', label: 'Selected' },
            { cls: 'seat seat-booked', label: 'Booked' },
          ].map(({ cls, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className={cls} style={{ width: '24px', height: '24px', pointerEvents: 'none', fontSize: '0' }} />
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Booking Panel */}
        <div className="glass-card" style={{ padding: '24px', maxWidth: '560px', margin: '0 auto' }}>
          {error && (
            <div className="alert alert-error" style={{ marginBottom: '16px' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {selectedSeats.length > 0 ? (
            <>
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Selected Seats:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedSeats.map((s) => (
                    <span key={s} className="badge badge-red">{s}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{selectedSeats.length} seat(s) × ₹{show.price}</p>
                  <p style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-red)' }}>₹{totalAmount}</p>
                </div>
                <button
                  className="btn-primary"
                  onClick={handleBooking}
                  disabled={booking}
                  style={{ padding: '14px 28px', fontSize: '15px' }}
                >
                  {booking ? (
                    <><div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> Booking…</>
                  ) : (
                    <><Ticket size={18} /> Confirm Booking</>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-secondary)' }}>
              <Info size={24} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
              <p>Click on green seats to select them</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
