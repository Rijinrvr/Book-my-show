import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { readJSON, writeJSON, generateId } from '@/lib/db';
import { signToken, createAuthHeaders } from '@/lib/auth';
import { User } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const users = readJSON<User>('users.json');
    const existing = users.find((u) => u.email === email);

    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: generateId('user'),
      name,
      email,
      password: hashedPassword,
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    writeJSON('users.json', users);

    const token = signToken({ id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name });

    const response = NextResponse.json({
      success: true,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      redirectTo: '/dashboard',
    });

    response.headers.set('Set-Cookie', createAuthHeaders(token)['Set-Cookie']);
    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
