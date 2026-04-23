import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON, generateId } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { Theater } from '@/lib/types';

export async function GET() {
  const theaters = readJSON<Theater>('theaters.json').filter((t) => t.status === 'active');
  return NextResponse.json(theaters);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await req.json();
  const { name, location, city, amenities, rows, seatsPerRow } = body;

  if (!name || !location || !city || !rows || !seatsPerRow) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const theaters = readJSON<Theater>('theaters.json');
  const rowsArr = typeof rows === 'string' ? rows.split(',').map((r: string) => r.trim()) : rows;
  const newTheater: Theater = {
    id: generateId('theater'),
    name,
    location,
    city,
    amenities: amenities || [],
    totalSeats: rowsArr.length * Number(seatsPerRow),
    rows: rowsArr,
    seatsPerRow: Number(seatsPerRow),
    status: 'active',
  };

  theaters.push(newTheater);
  writeJSON('theaters.json', theaters);
  return NextResponse.json(newTheater, { status: 201 });
}
