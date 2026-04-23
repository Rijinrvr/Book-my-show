'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, Clock, Globe } from 'lucide-react';
import { Movie } from '@/lib/types';

interface MovieCardProps {
  movie: Movie;
  href?: string;
}

export default function MovieCard({ movie, href }: MovieCardProps) {
  const link = href || `/movies/${movie.id}`;

  return (
    <Link href={link} style={{ textDecoration: 'none' }}>
      <div className="movie-card">
        <div style={{ position: 'relative', aspectRatio: '2/3', overflow: 'hidden' }}>
          {movie.poster ? (
            <img
              src={movie.poster}
              alt={movie.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              onError={(e) => {
                e.currentTarget.src = `https://via.placeholder.com/300x450/1a1a2e/ffffff?text=${encodeURIComponent(movie.title)}`;
              }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
              🎬
            </div>
          )}
          <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
            <span className="badge badge-gold" style={{ backdropFilter: 'blur(10px)', background: 'rgba(0,0,0,0.7)' }}>
              <Star size={10} fill="currentColor" /> {movie.rating}
            </span>
          </div>
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(10,10,15,0.95), transparent)',
            padding: '24px 12px 12px'
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {movie.genre.slice(0, 2).map((g) => (
                <span key={g} className="badge badge-red" style={{ fontSize: '9px' }}>{g}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="movie-card-body">
          <h3 className="movie-card-title" title={movie.title}>
            {movie.title.length > 20 ? movie.title.slice(0, 20) + '…' : movie.title}
          </h3>
          <div style={{ display: 'flex', gap: '12px', color: 'var(--text-secondary)', fontSize: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={11} /> {movie.duration}m
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Globe size={11} /> {movie.language}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
