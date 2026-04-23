import { NextRequest, NextResponse } from 'next/server';
import { readJSON } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { Booking, Show, Movie, Theater } from '@/lib/types';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const bookings = readJSON<Booking>('bookings.json');
  const booking = bookings.find((b) => b.id === id);

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

  if (session.role !== 'admin' && booking.userId !== session.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const shows = readJSON<Show>('shows.json');
  const movies = readJSON<Movie>('movies.json');
  const theaters = readJSON<Theater>('theaters.json');

  return NextResponse.json({
    ...booking,
    show: shows.find((s) => s.id === booking.showId),
    movie: movies.find((m) => m.id === booking.movieId),
    theater: theaters.find((t) => t.id === booking.theaterId),
  });
}
