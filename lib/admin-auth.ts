import { NextRequest } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { kv } from '@vercel/kv';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const TOKEN_SECRET = process.env.TOKEN_SECRET;
const TOKEN_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 15 * 60; // 15 minutes

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-real-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown';
}

export async function checkRateLimit(request: NextRequest): Promise<boolean> {
  const ip = getClientIp(request);
  const key = `admin_rate:${ip}`;
  const attempts = await kv.get<number>(key);
  return (attempts ?? 0) < MAX_ATTEMPTS;
}

export async function recordLoginAttempt(request: NextRequest): Promise<void> {
  const ip = getClientIp(request);
  const key = `admin_rate:${ip}`;
  const current = await kv.incr(key);
  if (current === 1) {
    // First attempt — set TTL
    await kv.expire(key, WINDOW_SECONDS);
  }
}

export function generateToken(): string {
  if (!TOKEN_SECRET) throw new Error('TOKEN_SECRET not configured');
  const timestamp = Date.now().toString();
  const signature = createHmac('sha256', TOKEN_SECRET).update(timestamp).digest('hex');
  return Buffer.from(`${timestamp}.${signature}`).toString('base64');
}

export function verifyPassword(password: string): boolean {
  if (!ADMIN_PASSWORD) return false;
  // Constant-time comparison
  const a = Buffer.from(password);
  const b = Buffer.from(ADMIN_PASSWORD);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function verifyToken(request: NextRequest): boolean {
  if (!TOKEN_SECRET) return false;
  // Read token from HttpOnly cookie only (no Authorization header to preserve httpOnly protection)
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const dotIndex = decoded.indexOf('.');
    if (dotIndex === -1) return false;

    const timestamp = decoded.slice(0, dotIndex);
    const signature = decoded.slice(dotIndex + 1);

    // Verify HMAC signature
    const expected = createHmac('sha256', TOKEN_SECRET).update(timestamp).digest('hex');
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return false;

    // Check expiry
    const ts = Number(timestamp);
    if (isNaN(ts)) return false;
    return Date.now() - ts < TOKEN_MAX_AGE_MS;
  } catch {
    return false;
  }
}
