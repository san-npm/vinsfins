import { NextRequest } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const TOKEN_SECRET = process.env.TOKEN_SECRET;
const TOKEN_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

// In-memory rate limiter (per-process, resets on deploy)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

export function checkRateLimit(request: NextRequest): boolean {
  const ip = getClientIp(request);
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (entry && now < entry.resetAt) {
    return entry.count < MAX_ATTEMPTS;
  }

  // Reset expired window
  if (entry && now >= entry.resetAt) {
    loginAttempts.delete(ip);
  }
  return true;
}

export function recordLoginAttempt(request: NextRequest): void {
  const ip = getClientIp(request);
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (entry && now < entry.resetAt) {
    entry.count++;
  } else {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
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
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) return false;
  const token = auth.slice(7);
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
