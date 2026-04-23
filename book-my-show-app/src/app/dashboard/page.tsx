'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import MovieCard from '@/components/MovieCard';
import { Movie } from '@/lib/types';
import { Search, TrendingUp, ArrowRight, X, ChevronLeft, ChevronRight, Play, Star } from 'lucide-react';

/* ─── Featured trailers ──────────────────────────────────────────── */
const FEATURED = [
  {
    movieId: 'movie-015',
    title: 'KGF: Chapter 2',
    tagline: 'His name is Rocky. His rule is FIRE.',
    genre: ['Action', 'Crime'],
    rating: 8.2,
    youtubeId: '4BPJaHiCZEI',
    gradient: 'linear-gradient(135deg, #7b0000 0%, #2d0000 60%, #0a0a0f 100%)',
    accent: '#ff4500',
  },
  {
    movieId: 'movie-002',
    title: 'Avengers: Endgame',
    tagline: 'Whatever it takes.',
    genre: ['Action', 'Sci-Fi'],
    rating: 8.4,
    youtubeId: 'TcMBFSGVi1c',
    gradient: 'linear-gradient(135deg, #0d1b4b 0%, #1a0a2e 60%, #0a0a0f 100%)',
    accent: '#4f8ef7',
  },
  {
    movieId: 'movie-014',
    title: 'RRR',
    tagline: 'Rise. Roar. Revolt.',
    genre: ['Action', 'Drama'],
    rating: 7.8,
    youtubeId: 'f_vbAtFSEc0',
    gradient: 'linear-gradient(135deg, #1a4a00 0%, #0a2200 60%, #0a0a0f 100%)',
    accent: '#4caf50',
  },
  {
    movieId: 'movie-009',
    title: 'Dune: Part Two',
    tagline: 'Long live the fighters.',
    genre: ['Sci-Fi', 'Adventure'],
    rating: 8.5,
    youtubeId: 'Way9Dexny3w',
    gradient: 'linear-gradient(135deg, #5c3a00 0%, #2a1a00 60%, #0a0a0f 100%)',
    accent: '#f5a623',
  },
  {
    movieId: 'movie-001',
    title: 'Interstellar',
    tagline: 'Mankind was born on Earth. It was never meant to die here.',
    genre: ['Sci-Fi', 'Drama'],
    rating: 8.6,
    youtubeId: 'zSWdZVtXT7E',
    gradient: 'linear-gradient(135deg, #001a3a 0%, #000d1f 60%, #0a0a0f 100%)',
    accent: '#00bcd4',
  },
  {
    movieId: 'movie-006',
    title: 'Oppenheimer',
    tagline: 'The world forever changes.',
    genre: ['Drama', 'History'],
    rating: 8.5,
    youtubeId: 'uYPbbksJxIg',
    gradient: 'linear-gradient(135deg, #3a1a00 0%, #1a0d00 60%, #0a0a0f 100%)',
    accent: '#ff8c00',
  },
];

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [moviesLoading, setMoviesLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (!loading && user?.role === 'admin') router.push('/admin');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    fetch('/api/movies')
      .then((r) => r.json())
      .then((data) => { setMovies(data); setMoviesLoading(false); });
  }, [user]);

  const goTo = useCallback((idx: number) => {
    setIsTransitioning(true);
    setShowTrailer(false);
    setTimeout(() => {
      setFeaturedIdx(idx);
      setIsTransitioning(false);
    }, 350);
  }, []);

  const next = useCallback(() => goTo((featuredIdx + 1) % FEATURED.length), [featuredIdx, goTo]);
  const prev = useCallback(() => goTo((featuredIdx - 1 + FEATURED.length) % FEATURED.length), [featuredIdx, goTo]);

  /* Auto-rotate every 8 seconds */
  useEffect(() => {
    autoPlayRef.current = setInterval(next, 8000);
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [next]);

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  const featured = FEATURED[featuredIdx];

  const filtered = search.trim()
    ? movies.filter((m) =>
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.director.toLowerCase().includes(search.toLowerCase()) ||
        m.cast.some((c) => c.toLowerCase().includes(search.toLowerCase())) ||
        m.genre.some((g) => g.toLowerCase().includes(search.toLowerCase()))
      )
    : movies;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      {/* ── Cinematic Hero Banner ──────────────────────────────── */}
      <div style={{ position: 'relative', height: '520px', overflow: 'hidden' }}>

        {/* Background gradient (colour per slide) */}
        <div style={{
          position: 'absolute', inset: 0,
          background: featured.gradient,
          transition: 'background 0.6s ease',
          opacity: isTransitioning ? 0 : 1,
        }} />

        {/* Animated colour blobs */}
        <div style={{
          position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
        }}>
          <div style={{
            position: 'absolute', top: '-20%', right: '-10%',
            width: '500px', height: '500px', borderRadius: '50%',
            background: `radial-gradient(circle, ${featured.accent}30 0%, transparent 70%)`,
            transition: 'background 0.6s ease',
            animation: 'pulse-blob 4s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', bottom: '-30%', left: '20%',
            width: '400px', height: '400px', borderRadius: '50%',
            background: `radial-gradient(circle, ${featured.accent}18 0%, transparent 70%)`,
            transition: 'background 0.6s ease',
            animation: 'pulse-blob 5s ease-in-out infinite 1s',
          }} />
        </div>

        {/* YouTube iframe (plays when user clicks Play) */}
        {showTrailer && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
            <iframe
              src={`https://www.youtube.com/embed/${featured.youtubeId}?autoplay=1&mute=0&rel=0&modestbranding=1`}
              allow="autoplay; fullscreen"
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
            <button
              onClick={() => setShowTrailer(false)}
              style={{
                position: 'absolute', top: '16px', right: '16px', zIndex: 20,
                background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '50%', width: '40px', height: '40px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#fff',
              }}
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Content overlay */}
        {!showTrailer && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to right, rgba(10,10,15,0.85) 0%, rgba(10,10,15,0.4) 60%, transparent 100%)',
            display: 'flex', alignItems: 'center',
            opacity: isTransitioning ? 0 : 1,
            transition: 'opacity 0.35s ease',
          }}>
            <div className="container" style={{ paddingLeft: '32px' }}>
              {/* Genre pills */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                {featured.genre.map((g) => (
                  <span key={g} className="badge badge-red" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>{g}</span>
                ))}
                <span className="badge badge-gold" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Star size={10} fill="currentColor" /> {featured.rating}
                </span>
              </div>

              {/* Title */}
              <h2 style={{
                fontSize: 'clamp(28px, 5vw, 52px)',
                fontWeight: 900,
                lineHeight: 1.1,
                marginBottom: '10px',
                color: '#fff',
                textShadow: '0 2px 20px rgba(0,0,0,0.5)',
                maxWidth: '540px',
              }}>
                {featured.title}
              </h2>

              {/* Tagline */}
              <p style={{
                fontSize: '16px',
                color: 'rgba(255,255,255,0.7)',
                marginBottom: '28px',
                maxWidth: '420px',
                fontStyle: 'italic',
              }}>
                "{featured.tagline}"
              </p>

              {/* CTA Buttons */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    setShowTrailer(true);
                    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '13px 28px',
                    background: featured.accent,
                    border: 'none', borderRadius: '12px',
                    color: '#fff', fontSize: '15px', fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: `0 4px 24px ${featured.accent}60`,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <Play size={18} fill="#fff" /> Play Trailer
                </button>

                <Link
                  href={`/movies/${featured.movieId}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '13px 24px',
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    color: '#fff', fontSize: '15px', fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.18)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
                >
                  Book Tickets →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Prev / Next arrows */}
        {!showTrailer && (
          <>
            <button
              onClick={prev}
              style={{
                position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '50%', width: '44px', height: '44px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#fff', zIndex: 5,
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.8)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.5)'; }}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '50%', width: '44px', height: '44px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#fff', zIndex: 5,
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.8)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.5)'; }}
            >
              <ChevronRight size={20} />
            </button>

            {/* Dot indicators */}
            <div style={{
              position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: '8px', zIndex: 5,
            }}>
              {FEATURED.map((f, i) => (
                <button
                  key={f.movieId}
                  onClick={() => goTo(i)}
                  style={{
                    width: i === featuredIdx ? '28px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    border: 'none',
                    background: i === featuredIdx ? featured.accent : 'rgba(255,255,255,0.3)',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>

            {/* Progress bar */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'rgba(255,255,255,0.1)', zIndex: 5 }}>
              <div
                key={featuredIdx}
                style={{
                  height: '100%',
                  background: featured.accent,
                  animation: 'progress-bar 8s linear',
                  transformOrigin: 'left',
                }}
              />
            </div>
          </>
        )}

        {/* Bottom fade to page bg */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px',
          background: 'linear-gradient(to bottom, transparent, var(--bg-primary))',
          pointerEvents: 'none', zIndex: 4,
        }} />
      </div>

      {/* ── Welcome + Search ──────────────────────────────────── */}
      <div style={{ background: 'var(--bg-primary)', padding: '28px 0 0' }}>
        <div className="container" style={{ padding: '0 24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800 }}>
              Hello, {user.name.split(' ')[0]} 👋
            </h1>
          </div>

          {/* Search Bar */}
          <div style={{ position: 'relative', maxWidth: '560px' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search movies, cast, director, genre…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                paddingLeft: '48px',
                paddingRight: search ? '44px' : '16px',
                fontSize: '15px',
                height: '50px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Movies Grid ───────────────────────────────────────── */}
      <div className="container" style={{ padding: '0 24px 48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <TrendingUp size={20} color="var(--accent-red)" />
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              {search.trim() ? 'Search Results' : 'Now Showing'}
            </h2>
          </div>
          {!search.trim() && (
            <Link href="/movies" style={{ color: 'var(--accent-red)', fontSize: '14px', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ArrowRight size={14} />
            </Link>
          )}
        </div>
        <p className="section-subtitle">
          {search.trim()
            ? filtered.length === 0 ? 'No movies match your search' : `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${search}"`
            : 'Book tickets for the latest blockbusters'}
        </p>

        {moviesLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
            <Search size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
            <p style={{ fontSize: '18px', fontWeight: 600, marginBottom: '6px' }}>No movies found</p>
            <p style={{ fontSize: '14px' }}>Try a different title, actor, or genre</p>
            <button onClick={() => setSearch('')} className="btn-secondary" style={{ marginTop: '20px', padding: '10px 24px' }}>
              Clear Search
            </button>
          </div>
        ) : (
          <div className="movies-grid">
            {filtered.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes pulse-blob {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        @keyframes progress-bar {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
}
