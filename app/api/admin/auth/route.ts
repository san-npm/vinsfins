import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, generateToken, checkRateLimit, recordLoginAttempt } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  if (!checkRateLimit(request)) {
    return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (!body.password || typeof body.password !== 'string') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (verifyPassword(body.password)) {
    return NextResponse.json({ token: generateToken() });
  }

  recordLoginAttempt(request);
  return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
}
