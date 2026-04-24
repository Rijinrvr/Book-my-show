'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import MovieCard from '@/components/MovieCard';
import { Movie } from '@/lib/types';
import { Ticket, Star, Shield, Zap, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    fetch('/api/movies').then((r) => r.json()).then(setMovies);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      {/* Hero */}
      <div className="hero">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="container">
            <div style={{ display: 'inline-block', marginBottom: '16px' }}>
              <span className="badge badge-red" style={{ fontSize: '12px', padding: '6px 14px' }}>
                🎬 India&apos;s #1 Ticket Booking Platform
              </span>
            </div>
            <h1 className="hero-title">
              Book Tickets.<br />Make Memories.
            </h1>
            <p className="hero-subtitle">
              Experience cinema like never before. Book seats at the best theaters near you in just a few clicks.
            </p>
            {user ? (
              <Link href={user.role === 'admin' ? '/admin' : '/dashboard'} className="btn-primary" style={{ fontSize: '16px', padding: '14px 32px' }}>
                Go to Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/register" className="btn-primary" style={{ fontSize: '16px', padding: '14px 32px' }}>
                  Book Now <Ticket size={18} />
                </Link>
                <Link href="/login" className="btn-secondary" style={{ fontSize: '16px', padding: '14px 32px' }}>
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: '60px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
            {[
              { icon: <Ticket size={24} />, title: 'Easy Booking', desc: 'Select seats, choose showtime, confirm in seconds.', color: 'var(--accent-red)' },
              { icon: <Star size={24} />, title: 'Best Movies', desc: 'Latest blockbusters across top theaters nationwide.', color: 'var(--accent-gold)' },
              { icon: <Shield size={24} />, title: 'Secure Payments', desc: 'Safe and encrypted transactions every time.', color: '#22c55e' },
              { icon: <Zap size={24} />, title: 'Instant Confirmation', desc: 'Get your e-ticket immediately after booking.', color: '#3b82f6' },
            ].map(({ icon, title, desc, color }) => (
              <div key={title} className="glass-card" style={{ padding: '28px', textAlign: 'center', height: '100%' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, margin: '0 auto 16px' }}>
                  {icon}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>{title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Movies */}
      {movies.length > 0 && (
        <div style={{ padding: '60px 0' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
              <h2 className="section-title" style={{ marginBottom: 0 }}>Now Showing</h2>
              {user && (
                <Link href="/dashboard" style={{ color: 'var(--accent-red)', fontSize: '14px', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  View All <ArrowRight size={14} />
                </Link>
              )}
            </div>
            <p className="section-subtitle">Book tickets for the latest blockbusters</p>
            <div className="movies-grid">
              {movies.slice(0, 5).map((movie) => (
                <MovieCard key={movie.id} movie={movie} href={user ? `/movies/${movie.id}` : '/login'} />
              ))}
            </div>
            {!user && (
              <div style={{ textAlign: 'center', marginTop: '36px' }}>
                <Link href="/register" className="btn-primary" style={{ fontSize: '15px' }}>
                  Sign Up to Book Tickets <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '40px 0', background: 'var(--bg-secondary)' }}>
        <div className="container mobile-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px' }}>
          <div style={{ textAlign: 'inherit' }}>
            <div style={{ fontSize: '18px', fontWeight: 800, background: 'linear-gradient(135deg, var(--accent-red), #ff6b7a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '4px' }}>
              🎬 BookMyShow
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>India&apos;s leading cinema ticket booking platform</p>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>© 2024 BookMyShow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
