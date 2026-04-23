import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON, generateId } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { Movie } from '@/lib/types';

export async function GET() {
  const movies = readJSON<Movie>('movies.json').filter((m) => m.status === 'active');
  return NextResponse.json(movies);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await req.json();
  const { title, description, poster, genre, duration, rating, language, releaseDate, cast, director } = body;

  if (!title || !description || !duration) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const movies = readJSON<Movie>('movies.json');
  const newMovie: Movie = {
    id: generateId('movie'),
    title,
    description,
    poster: poster || '',
    genre: genre || [],
    duration: Number(duration),
    rating: Number(rating) || 0,
    language: language || 'English',
    releaseDate: releaseDate || '',
    cast: cast || [],
    director: director || '',
    status: 'active',
  };

  movies.push(newMovie);
  writeJSON('movies.json', movies);
  return NextResponse.json(newMovie, { status: 201 });
}
