import { NextResponse } from 'next/server';
import { readJSON } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { User, Movie, Theater, Show, Booking } from '@/lib/types';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const users = readJSON<User>('users.json');
  const movies = readJSON<Movie>('movies.json');
  const theaters = readJSON<Theater>('theaters.json');
  const shows = readJSON<Show>('shows.json');
  const bookings = readJSON<Booking>('bookings.json');

  const totalRevenue = bookings
    .filter((b) => b.paymentStatus === 'confirmed')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  return NextResponse.json({
    totalUsers: users.filter((u) => u.role === 'user').length,
    totalMovies: movies.length,
    totalTheaters: theaters.length,
    totalShows: shows.length,
    totalBookings: bookings.length,
    totalRevenue,
    recentBookings: bookings.slice(-5).reverse(),
  });
}
