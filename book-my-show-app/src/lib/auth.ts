import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'bookmyshow-secret-key-2024';
const TOKEN_NAME = 'bms_token';

export interface JwtPayload {
  id: string;
  email: string;
  role: 'user' | 'admin';
  name: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function createAuthHeaders(token: string) {
  return {
    'Set-Cookie': `${TOKEN_NAME}=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`,
  };
}

export function clearAuthCookie() {
  return {
    'Set-Cookie': `${TOKEN_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`,
  };
}
