import { type NextRequest } from 'next/server';

export function isDevRequest(req: NextRequest): boolean {
  if (process.env.NODE_ENV === 'production') return false;
  if (req.headers.get('x-forwarded-for')) return false;
  return true;
}
