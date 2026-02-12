import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/admin-auth';
import { menuItems } from '@/data/menu';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'menu.json');

function getMenuItems() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
  } catch {
    // fall through
  }
  return menuItems;
}

export async function GET(request: NextRequest) {
  if (!verifyToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(getMenuItems());
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
