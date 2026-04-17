import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, generateToken, checkRateLimit, recordLoginAttempt } from '@/lib/admin-auth';

const COOKIE_NAME = 'admin_token';
const COOKIE_MAX_AGE = 24 * 60 * 60; // 24 hours in seconds

export async function POST(request: NextRequest) {
  const rl = await checkRateLimit(request);
  if (!rl.ok) {
    return NextResponse.json(
      { error: rl.unavailable ? 'Service temporarily unavailable' : 'Too many attempts' },
      { status: rl.unavailable ? 503 : 429 },
    );
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

  await recordLoginAttempt(request);

  if (verifyPassword(body.password)) {
    const token = generateToken();
    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/api/admin',
      maxAge: COOKIE_MAX_AGE,
    });
    return response;
  }

  return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
