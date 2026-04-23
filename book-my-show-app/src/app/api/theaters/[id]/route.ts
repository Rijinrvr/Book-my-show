import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON, deleteOne } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { Theater } from '@/lib/types';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const theaters = readJSON<Theater>('theaters.json');
  const theater = theaters.find((t) => t.id === id);
  if (!theater) return NextResponse.json({ error: 'Theater not found' }, { status: 404 });
  return NextResponse.json(theater);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await req.json();
  const theaters = readJSON<Theater>('theaters.json');
  const index = theaters.findIndex((t) => t.id === id);
  if (index === -1) return NextResponse.json({ error: 'Theater not found' }, { status: 404 });

  theaters[index] = { ...theaters[index], ...body };
  writeJSON('theaters.json', theaters);
  return NextResponse.json(theaters[index]);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const deleted = deleteOne<Theater>('theaters.json', id);
  if (!deleted) return NextResponse.json({ error: 'Theater not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
