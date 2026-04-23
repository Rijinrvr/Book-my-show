'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Movie, Show, Theater } from '@/lib/types';
import { Star, Clock, Globe, Calendar, MapPin, ChevronRight, Film, Users } from 'lucide-react';

interface ShowWithDetails extends Show {
  movie: Movie;
  theater: Theater;
}

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [shows, setShows] = useState<ShowWithDetails[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Parse YYYY-MM-DD safely without timezone shift
  const parseLocalDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch(`/api/movies/${id}`).then((r) => r.json()),
      fetch(`/api/shows?movieId=${id}`).then((r) => r.json()),
    ]).then(([movieData, showsData]) => {
      // Guard: ensure movieData is a valid movie object (not an error response)
      if (movieData && movieData.id && movieData.title) {
        setMovie(movieData);
      } else {
        setMovie(null);
      }
      const validShows = Array.isArray(showsData) ? showsData : [];
      setShows(validShows);
      const dates = [...new Set(validShows.map((s: ShowWithDetails) => s.date))];
      if (dates.length > 0) setSelectedDate(dates[0] as string);
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

  if (!movie) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Navbar />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
          <Film size={64} style={{ opacity: 0.2 }} />
          <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Movie Not Found</h2>
          <p style={{ color: 'var(--text-secondary)' }}>This movie doesn&apos;t exist or has been removed.</p>
          <Link href="/movies" className="btn-primary">Browse All Movies</Link>
        </div>
      </div>
    );
  }

  const availableDates = [...new Set(shows.map((s) => s.date))];
  const filteredShows = shows.filter((s) => s.date === selectedDate);
  const theaterGroups = filteredShows.reduce((acc, show) => {
    const tid = show.theaterId;
    if (!acc[tid]) acc[tid] = { theater: show.theater, shows: [] };
    acc[tid].shows.push(show);
    return acc;
  }, {} as Record<string, { theater: Theater; shows: ShowWithDetails[] }>);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      {/* Movie Hero */}
      <div style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--border)' }}>
        {/* Blurred backdrop */}
        {movie.poster && (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${movie.poster})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: 'blur(40px) brightness(0.15)',
            transform: 'scale(1.2)',
          }} />
        )}
        <div style={{ position: 'relative', zIndex: 1, padding: '48px 0' }}>
          <div className="container">
            <div style={{ display: 'flex', gap: '36px', flexWrap: 'wrap' }}>
              {/* Poster */}
              <div style={{ flexShrink: 0 }}>
                <img
                  src={movie.poster}
                  alt={movie.title}
                  style={{ width: '200px', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.7)', display: 'block' }}
                  onError={(e) => { e.currentTarget.src = `https://via.placeholder.com/200x300/1a1a2e/fff?text=${encodeURIComponent(movie.title)}`; }}
                />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: '260px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {movie.genre.map((g) => (
                    <span key={g} className="badge badge-red">{g}</span>
                  ))}
                </div>
                <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '12px', letterSpacing: '-0.5px' }}>
                  {movie.title}
                </h1>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <div className="movie-card-rating">
                    <Star size={16} fill="currentColor" /> {movie.rating}/10
                  </div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                    <Clock size={14} /> {movie.duration} min
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                    <Globe size={14} /> {movie.language}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                    <Calendar size={14} /> {movie.releaseDate}
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '600px', marginBottom: '20px' }}>
                  {movie.description}
                </p>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <span><strong style={{ color: 'var(--text-primary)' }}>Director:</strong> {movie.director}</span>
                  <span><strong style={{ color: 'var(--text-primary)' }}>Cast:</strong> {movie.cast.slice(0, 3).join(', ')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Show timings */}
      <div className="container" style={{ padding: '40px 24px' }}>
        <h2 className="section-title">Book Tickets</h2>
        <p className="section-subtitle">Select a date and show timing</p>

        {/* Date selector */}
        {availableDates.length > 0 ? (
          <>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '32px', flexWrap: 'wrap' }}>
              {availableDates.map((date) => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`show-time-card ${selectedDate === date ? 'selected' : ''}`}
                  style={{ minWidth: '100px' }}
                >
                  <div style={{ fontWeight: 700, fontSize: '14px', color: selectedDate === date ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                    {mounted ? parseLocalDate(date).toLocaleDateString('en-IN', { weekday: 'short' }) : date}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {mounted ? parseLocalDate(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : date}
                  </div>
                </button>
              ))}
            </div>

            {/* Theaters & shows */}
            {Object.values(theaterGroups).map(({ theater, shows: theaterShows }) => (
              <div key={theater.id} className="glass-card" style={{ padding: '24px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '4px' }}>{theater.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                      <MapPin size={13} /> {theater.location}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {theater.amenities?.slice(0, 3).map((a) => (
                      <span key={a} className="badge badge-gray">{a}</span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {theaterShows.map((show) => (
                    <Link key={show.id} href={`/shows/${show.id}/seats`} style={{ textDecoration: 'none' }}>
                      <div className="show-time-card" style={{ minWidth: '140px' }}>
                        <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                          {show.time}
                        </div>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '8px' }}>
                          <span className="badge badge-gray" style={{ fontSize: '10px' }}>{show.format}</span>
                          <span className="badge badge-gray" style={{ fontSize: '10px' }}>{show.language}</span>
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                          ₹{show.price} per seat
                        </div>
                        <div style={{ fontSize: '11px', color: show.availableSeats > 20 ? '#22c55e' : '#f59e0b' }}>
                          {show.availableSeats} seats left
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
            <Film size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
            <p>No shows scheduled for this movie.</p>
          </div>
        )}
      </div>
    </div>
  );
}
