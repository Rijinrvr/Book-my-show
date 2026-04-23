'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import MovieCard from '@/components/MovieCard';
import { Movie } from '@/lib/types';
import { Search, TrendingUp, ArrowRight, X } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [moviesLoading, setMoviesLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (!loading && user?.role === 'admin') router.push('/admin');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    fetch('/api/movies')
      .then((r) => r.json())
      .then((data) => {
        setMovies(data);
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

      {/* Hero welcome */}
      <div style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a0a12 100%)', padding: '48px 0 40px', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '6px' }}>
            Hello, {user.name.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '28px' }}>
            Discover and book your next cinema experience
          </p>

          {/* Search Bar */}
          <div style={{ position: 'relative', maxWidth: '560px' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            />
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
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                  borderRadius: '4px',
                }}
                title="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px' }}>
        {/* Section Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <TrendingUp size={20} color="var(--accent-red)" />
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              {search.trim() ? 'Search Results' : 'Now Showing'}
            </h2>
          </div>
          {!search.trim() && (
            <Link
              href="/movies"
              style={{ color: 'var(--accent-red)', fontSize: '14px', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              View All <ArrowRight size={14} />
            </Link>
          )}
        </div>

        <p className="section-subtitle">
          {search.trim()
            ? filtered.length === 0
              ? 'No movies match your search'
              : `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${search}"`
            : 'Book tickets for the latest blockbusters'}
        </p>

        {/* Movies Grid */}
        {moviesLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
            <Search size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
            <p style={{ fontSize: '18px', fontWeight: 600, marginBottom: '6px' }}>No movies found</p>
            <p style={{ fontSize: '14px' }}>Try a different title, actor, or genre</p>
            <button
              onClick={() => setSearch('')}
              className="btn-secondary"
              style={{ marginTop: '20px', padding: '10px 24px' }}
            >
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
    </div>
  );
}
