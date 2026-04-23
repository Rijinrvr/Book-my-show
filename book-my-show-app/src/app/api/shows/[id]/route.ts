import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON, deleteOne } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { Show } from '@/lib/types';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const shows = readJSON<Show>('shows.json');
  const show = shows.find((s) => s.id === id);
  if (!show) return NextResponse.json({ error: 'Show not found' }, { status: 404 });
  return NextResponse.json(show);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await req.json();
  const shows = readJSON<Show>('shows.json');
  const index = shows.findIndex((s) => s.id === id);
  if (index === -1) return NextResponse.json({ error: 'Show not found' }, { status: 404 });

  shows[index] = { ...shows[index], ...body };
  writeJSON('shows.json', shows);
  return NextResponse.json(shows[index]);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const deleted = deleteOne<Show>('shows.json', id);
  if (!deleted) return NextResponse.json({ error: 'Show not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
