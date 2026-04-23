'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import MovieCard from '@/components/MovieCard';
import { Movie } from '@/lib/types';
import { Search, Film, ChevronDown, X } from 'lucide-react';

export default function MoviesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [moviesLoading, setMoviesLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [genreOpen, setGenreOpen] = useState(false);
  const genreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (genreRef.current && !genreRef.current.contains(e.target as Node)) {
        setGenreOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  const allGenres = [...new Set(movies.flatMap((m) => m.genre))].sort();

  const filtered = movies.filter((m) => {
    const matchesSearch =
      !search ||
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.director.toLowerCase().includes(search.toLowerCase()) ||
      m.cast.some((c) => c.toLowerCase().includes(search.toLowerCase()));
    const matchesGenre = !genreFilter || m.genre.includes(genreFilter);
    return matchesSearch && matchesGenre;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #1a0a0f 100%)', padding: '48px 0 36px', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <h1 className="section-title" style={{ marginBottom: '6px' }}>Now Showing</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            {movies.length} movie{movies.length !== 1 ? 's' : ''} available
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>

          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search movies, directors, cast…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '42px' }}
            />
          </div>

          {/* Custom Genre Dropdown */}
          <div ref={genreRef} style={{ position: 'relative', minWidth: '180px' }}>
            {/* Trigger Button */}
            <button
              onClick={() => setGenreOpen((o) => !o)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${genreOpen ? 'var(--accent-red)' : 'var(--border)'}`,
                borderRadius: '10px',
                padding: '11px 14px',
                color: genreFilter ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxShadow: genreOpen ? '0 0 0 3px rgba(229,9,20,0.12)' : 'none',
                outline: 'none',
              }}
            >
              {/* Left: label or active genre badge */}
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                {genreFilter
                  ? <span className="badge badge-red" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>{genreFilter}</span>
                  : <span>All Genres</span>
                }
              </span>

              {/* Right: clear + chevron */}
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                {genreFilter && (
                  <span
                    role="button"
                    onClick={(e) => { e.stopPropagation(); setGenreFilter(''); }}
                    title="Clear filter"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '2px',
                      borderRadius: '4px',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={13} />
                  </span>
                )}
                <ChevronDown
                  size={14}
                  style={{
                    color: 'var(--text-muted)',
                    transition: 'transform 0.2s',
                    transform: genreOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </span>
            </button>

            {/* Dropdown Panel */}
            {genreOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                right: 0,
                minWidth: '180px',
                background: '#16162a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '6px',
                zIndex: 200,
                boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
              }}>
                {/* All Genres option */}
                <button
                  onClick={() => { setGenreFilter(''); setGenreOpen(false); }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: genreFilter === '' ? '#e50914' : '#a0a0b8',
                    background: genreFilter === '' ? 'rgba(229,9,20,0.1)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  onMouseEnter={(e) => {
                    if (genreFilter !== '') {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                      e.currentTarget.style.color = '#ffffff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = genreFilter === '' ? 'rgba(229,9,20,0.1)' : 'transparent';
                    e.currentTarget.style.color = genreFilter === '' ? '#e50914' : '#a0a0b8';
                  }}
                >
                  {genreFilter === '' && (
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#e50914', flexShrink: 0, display: 'inline-block' }} />
                  )}
                  All Genres
                </button>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />

                {allGenres.map((g) => (
                  <button
                    key={g}
                    onClick={() => { setGenreFilter(g); setGenreOpen(false); }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: genreFilter === g ? 700 : 400,
                      color: genreFilter === g ? '#e50914' : '#c8c8e0',
                      background: genreFilter === g ? 'rgba(229,9,20,0.1)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = genreFilter === g ? 'rgba(229,9,20,0.18)' : 'rgba(255,255,255,0.07)';
                      e.currentTarget.style.color = genreFilter === g ? '#ff3344' : '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = genreFilter === g ? 'rgba(229,9,20,0.1)' : 'transparent';
                      e.currentTarget.style.color = genreFilter === g ? '#e50914' : '#c8c8e0';
                    }}
                  >
                    {genreFilter === g && (
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#e50914', flexShrink: 0, display: 'inline-block' }} />
                    )}
                    {g}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {moviesLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-secondary)' }}>
            <Film size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p style={{ fontSize: '18px', fontWeight: 600, marginBottom: '6px' }}>No movies found</p>
            <p style={{ fontSize: '14px' }}>Try adjusting your search or filter</p>
          </div>
        ) : (
          <>
            {(search || genreFilter) && (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
                Showing {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                {genreFilter && ` in "${genreFilter}"`}
                {search && ` for "${search}"`}
              </p>
            )}
            <div className="movies-grid">
              {filtered.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
