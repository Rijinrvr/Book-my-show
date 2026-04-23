'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { BookingWithDetails } from '@/lib/types';
import { CheckCircle, Ticket, MapPin, Calendar, Clock, Download, Home } from 'lucide-react';

function BookingConfirmationContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get('success') === 'true';
  const { user, loading } = useAuth();
  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/bookings/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setBooking(data);
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

  if (!booking) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      <div className="container" style={{ padding: '48px 24px', maxWidth: '600px' }}>
        {/* Success Banner */}
        {isSuccess && (
          <div className="alert alert-success" style={{ marginBottom: '32px', padding: '16px 20px', fontSize: '15px', justifyContent: 'center' }}>
            <CheckCircle size={20} /> Booking Confirmed! Enjoy your movie 🎬
          </div>
        )}

        {/* Ticket */}
        <div className="ticket">
          {/* Header */}
          <div className="ticket-header">
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎟️</div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>
              {booking.movie?.title}
            </h1>
            <p style={{ opacity: 0.85, fontSize: '14px' }}>{booking.theater?.name}</p>
          </div>

          {/* Tear-off divider */}
          <div className="ticket-divider" style={{ margin: '0 -1px' }}>
            <div className="ticket-hole" style={{ marginLeft: '-12px' }} />
            <div className="ticket-hole" style={{ marginRight: '-12px', marginLeft: 'auto' }} />
          </div>

          {/* Body */}
          <div className="ticket-body">
            <div className="ticket-row">
              <span className="ticket-label">Booking Ref</span>
              <span className="ticket-value" style={{ fontFamily: 'monospace', color: 'var(--accent-red)', letterSpacing: '1px' }}>
                #{booking.bookingRef}
              </span>
            </div>
            <div className="ticket-row">
              <span className="ticket-label"><Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />Date</span>
              <span className="ticket-value">{booking.show?.date}</span>
            </div>
            <div className="ticket-row">
              <span className="ticket-label"><Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />Time</span>
              <span className="ticket-value">{booking.show?.time}</span>
            </div>
            <div className="ticket-row">
              <span className="ticket-label">Format</span>
              <span className="ticket-value">{booking.show?.format} • {booking.show?.language}</span>
            </div>
            <div className="ticket-row">
              <span className="ticket-label"><MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />Theater</span>
              <span className="ticket-value" style={{ textAlign: 'right', maxWidth: '220px' }}>{booking.theater?.location}</span>
            </div>
            <div className="ticket-row">
              <span className="ticket-label">Seats</span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {booking.seats.map((s) => (
                  <span key={s} className="badge badge-red">{s}</span>
                ))}
              </div>
            </div>
            <div className="ticket-row">
              <span className="ticket-label">Booked by</span>
              <span className="ticket-value">{booking.userName}</span>
            </div>
            <div className="ticket-row" style={{ paddingTop: '14px', marginTop: '4px', borderTop: '1px dashed var(--border)', borderBottom: 'none' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Total Amount</span>
              <span style={{ fontSize: '24px', fontWeight: 900, color: 'var(--accent-red)' }}>₹{booking.totalAmount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
              <span className={`badge ${booking.paymentStatus === 'confirmed' ? 'badge-green' : 'badge-gray'}`} style={{ fontSize: '12px', padding: '6px 16px' }}>
                ✓ Payment {booking.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/dashboard" className="btn-primary">
            <Home size={16} /> Back to Dashboard
          </Link>
          <button onClick={() => window.print()} className="btn-secondary">
            <Download size={16} /> Print Ticket
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>}>
      <BookingConfirmationContent />
    </Suspense>
  );
}
