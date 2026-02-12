import { NextRequest } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'vinsfins2024';
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'vinsfins-secret-2024';

export function generateToken(): string {
  const payload = `${TOKEN_SECRET}-${Date.now()}`;
  // Simple base64 token (not JWT, but sufficient for this use case)
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
    return decoded.startsWith(TOKEN_SECRET);
  } catch {
    return false;
  }
}
