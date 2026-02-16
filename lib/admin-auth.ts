import { NextRequest } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'vinsfins2024';
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'vinsfins-secret-2024';
const TOKEN_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export function generateToken(): string {
  const payload = `${TOKEN_SECRET}-${Date.now()}`;
  return Buffer.from(payload).toString('base64');
}

export function verifyPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export function verifyToken(request: NextRequest): boolean {
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) return false;
  const token = auth.slice(7);
  try {
    const decoded = Buffer.from(token, 'base64').toString();
    if (!decoded.startsWith(TOKEN_SECRET)) return false;
    const timestamp = Number(decoded.slice(TOKEN_SECRET.length + 1));
    if (isNaN(timestamp)) return false;
    return Date.now() - timestamp < TOKEN_MAX_AGE_MS;
  } catch {
    return false;
  }
}
