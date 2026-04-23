import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { readJSON } from '@/lib/db';
import { signToken, createAuthHeaders } from '@/lib/auth';
import { User } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const users = readJSON<User>('users.json');
    const user = users.find((u) => u.email === email);

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      redirectTo: user.role === 'admin' ? '/admin' : '/dashboard',
    });

    response.headers.set('Set-Cookie', createAuthHeaders(token)['Set-Cookie']);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
