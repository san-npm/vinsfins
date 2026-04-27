import { NextResponse, type NextRequest } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { verifyToken } from '@/lib/admin-auth';

const DECISIONS_PATH = join(process.cwd(), 'scripts/v2/state/decisions.json');

export async function GET(req: NextRequest) {
  if (!verifyToken(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!existsSync(DECISIONS_PATH)) return NextResponse.json([]);
  return NextResponse.json(JSON.parse(readFileSync(DECISIONS_PATH, 'utf-8')));
}

export async function POST(req: NextRequest) {
  if (!verifyToken(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.json();
  if (!body.wineId || !body.action) return NextResponse.json({ error: 'bad-request' }, { status: 400 });

  mkdirSync(join(process.cwd(), 'scripts/v2/state'), { recursive: true });
  const existing: any[] = existsSync(DECISIONS_PATH) ? JSON.parse(readFileSync(DECISIONS_PATH, 'utf-8')) : [];
  const filtered = existing.filter((d) => d.wineId !== body.wineId);
  filtered.push({ ...body, timestamp: Date.now() });
  writeFileSync(DECISIONS_PATH, JSON.stringify(filtered, null, 2));
  return NextResponse.json({ ok: true, count: filtered.length });
}
