import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, generateToken } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (verifyPassword(body.password)) {
    return NextResponse.json({ token: generateToken() });
  }
  return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
}
