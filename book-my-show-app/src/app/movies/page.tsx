'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import MovieCard from '@/components/MovieCard';
import { Movie } from '@/lib/types';
import { Search, Film, SlidersHorizontal } from 'lucide-react';

export default function MoviesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [moviesLoading, setMoviesLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState('');

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

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  // Gather all unique genres
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
          <div style={{ position: 'relative', minWidth: '160px' }}>
            <SlidersHorizontal size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <select
              className="input-field"
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              style={{ paddingLeft: '42px', cursor: 'pointer' }}
            >
              <option value="">All Genres</option>
              {allGenres.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
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
