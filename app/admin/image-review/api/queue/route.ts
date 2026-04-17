import { NextResponse, type NextRequest } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { wines } from '@/data/wines';

const CLASSIFIED = join(process.cwd(), 'scripts/v2/state/classified.json');

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  if (req.headers.get('x-forwarded-for')) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  if (!existsSync(CLASSIFIED)) return NextResponse.json([]);
  const classified = JSON.parse(readFileSync(CLASSIFIED, 'utf-8'));
  const byId = new Map(wines.map((w: any) => [w.id, w]));
  const queue = classified
    .filter((c: any) => c.decision === 'flag')
    .map((c: any) => {
      const w = byId.get(c.wineId);
      return {
        ...c,
        wine: w ? { id: w.id, name: w.name, region: w.region, country: w.country, grape: w.grape, category: w.category, currentImage: w.image } : null,
      };
    })
    .filter((c: any) => c.wine);
  return NextResponse.json(queue);
}
