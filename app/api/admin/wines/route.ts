import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/admin-auth';
import { wines } from '@/data/wines';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'wines.json');

function getWines() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
  } catch {
    // fall through
  }
  return wines;
}

export async function GET(request: NextRequest) {
  if (!verifyToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(getWines());
}

export async function POST(request: NextRequest) {
  if (!verifyToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const items = await request.json();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true, warning: 'Read-only filesystem — use a database for production.' });
  }
}
