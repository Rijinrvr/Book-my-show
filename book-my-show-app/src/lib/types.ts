export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  poster: string;
  genre: string[];
  duration: number;
  rating: number;
  language: string;
  releaseDate: string;
  cast: string[];
  director: string;
  status: 'active' | 'inactive';
}

export interface Theater {
  id: string;
  name: string;
  location: string;
  city: string;
  amenities: string[];
  totalSeats: number;
  rows: string[];
  seatsPerRow: number;
  status: 'active' | 'inactive';
}

export interface Show {
  id: string;
  movieId: string;
  theaterId: string;
  date: string;
  time: string;
  price: number;
  language: string;
  format: string;
  availableSeats: number;
  bookedSeats: string[];
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  showId: string;
  movieId: string;
  theaterId: string;
  seats: string[];
  totalAmount: number;
  paymentStatus: 'pending' | 'confirmed' | 'cancelled';
  bookingDate: string;
  bookingRef: string;
}

export interface ShowWithDetails extends Show {
  movie: Movie;
  theater: Theater;
}

export interface BookingWithDetails extends Booking {
  show: Show;
  movie: Movie;
  theater: Theater;
}
