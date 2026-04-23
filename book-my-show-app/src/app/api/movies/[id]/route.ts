import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON, deleteOne } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { Movie } from '@/lib/types';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const movies = readJSON<Movie>('movies.json');
  const movie = movies.find((m) => m.id === id);
  if (!movie) return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
  return NextResponse.json(movie);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await req.json();
  const movies = readJSON<Movie>('movies.json');
  const index = movies.findIndex((m) => m.id === id);
  if (index === -1) return NextResponse.json({ error: 'Movie not found' }, { status: 404 });

  movies[index] = { ...movies[index], ...body };
  writeJSON('movies.json', movies);
  return NextResponse.json(movies[index]);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const deleted = deleteOne<Movie>('movies.json', id);
  if (!deleted) return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
