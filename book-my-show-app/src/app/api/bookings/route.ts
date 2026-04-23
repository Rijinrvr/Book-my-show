import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON, generateId } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { Booking, Show, Movie, Theater } from '@/lib/types';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  let bookings = readJSON<Booking>('bookings.json');

  // Non-admins can only see their own bookings
  if (session.role !== 'admin') {
    bookings = bookings.filter((b) => b.userId === session.id);
  } else if (userId) {
    bookings = bookings.filter((b) => b.userId === userId);
  }

  const shows = readJSON<Show>('shows.json');
  const movies = readJSON<Movie>('movies.json');
  const theaters = readJSON<Theater>('theaters.json');

  const enriched = bookings.map((booking) => {
    const show = shows.find((s) => s.id === booking.showId);
    return {
      ...booking,
      show,
      movie: movies.find((m) => m.id === booking.movieId),
      theater: theaters.find((t) => t.id === booking.theaterId),
    };
  });

  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { showId, seats } = await req.json();

  if (!showId || !seats || seats.length === 0) {
    return NextResponse.json({ error: 'Show ID and seats are required' }, { status: 400 });
  }

  const shows = readJSON<Show>('shows.json');
  const showIndex = shows.findIndex((s) => s.id === showId);

  if (showIndex === -1) {
    return NextResponse.json({ error: 'Show not found' }, { status: 404 });
  }

  const show = shows[showIndex];

  // Check for seat conflicts (prevent double booking)
  const conflictSeats = seats.filter((seat: string) => show.bookedSeats.includes(seat));
  if (conflictSeats.length > 0) {
    return NextResponse.json(
      { error: `Seats already booked: ${conflictSeats.join(', ')}` },
      { status: 409 }
    );
  }

  // Update show's booked seats
  shows[showIndex].bookedSeats = [...show.bookedSeats, ...seats];
  shows[showIndex].availableSeats = show.availableSeats - seats.length;
  writeJSON('shows.json', shows);

  // Create booking record
  const bookings = readJSON<Booking>('bookings.json');
  const newBooking: Booking = {
    id: generateId('booking'),
    userId: session.id,
    userName: session.name,
    userEmail: session.email,
    showId,
    movieId: show.movieId,
    theaterId: show.theaterId,
    seats,
    totalAmount: show.price * seats.length,
    paymentStatus: 'confirmed',
    bookingDate: new Date().toISOString(),
    bookingRef: `BMS${Date.now().toString().slice(-8)}`,
  };

  bookings.push(newBooking);
  writeJSON('bookings.json', bookings);

  return NextResponse.json(newBooking, { status: 201 });
}
