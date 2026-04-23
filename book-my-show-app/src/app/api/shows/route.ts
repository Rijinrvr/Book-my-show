import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON, generateId } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { Show, Movie, Theater } from '@/lib/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const movieId = searchParams.get('movieId');
  const theaterId = searchParams.get('theaterId');

  let shows = readJSON<Show>('shows.json');

  if (movieId) shows = shows.filter((s) => s.movieId === movieId);
  if (theaterId) shows = shows.filter((s) => s.theaterId === theaterId);

  // Enrich with movie and theater data
  const movies = readJSON<Movie>('movies.json');
  const theaters = readJSON<Theater>('theaters.json');

  const enriched = shows.map((show) => ({
    ...show,
    movie: movies.find((m) => m.id === show.movieId),
    theater: theaters.find((t) => t.id === show.theaterId),
  }));

  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await req.json();
  const { movieId, theaterId, date, time, price, language, format } = body;

  if (!movieId || !theaterId || !date || !time || !price) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const theaters = readJSON<Theater>('theaters.json');
  const theater = theaters.find((t) => t.id === theaterId);
  if (!theater) return NextResponse.json({ error: 'Theater not found' }, { status: 404 });

  const shows = readJSON<Show>('shows.json');
  const newShow: Show = {
    id: generateId('show'),
    movieId,
    theaterId,
    date,
    time,
    price: Number(price),
    language: language || 'English',
    format: format || '2D',
    availableSeats: theater.totalSeats,
    bookedSeats: [],
  };

  shows.push(newShow);
  writeJSON('shows.json', shows);
  return NextResponse.json(newShow, { status: 201 });
}
