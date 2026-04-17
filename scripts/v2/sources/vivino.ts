import * as cheerio from 'cheerio';
import type { Wine, Candidate } from '../types';

export function parseVivinoResults(html: string): Candidate[] {
  const $ = cheerio.load(html);
  const out: Candidate[] = [];
  $('.wine-card, [class*="wineCard"]').each((_, el) => {
    const card = $(el);
    const img = card.find('img').first();
    const src = img.attr('src') || img.attr('data-src') || '';
    const nameEl = card.find('.wine-card__name, [class*="wineCardName"]').first();
    const link = card.find('a').first().attr('href') || '';
    if (!src || !src.includes('vivino.com')) return;
    const hiRes = src.replace(/_\d+x\d+\./, '_600x900.').replace('_pb_x300', '_pb_x600');
    out.push({
      imageUrl: hiRes,
      sourcePageUrl: link.startsWith('http') ? link : `https://www.vivino.com${link}`,
      sourcePageTitle: nameEl.text().trim(),
      source: 'vivino',
    });
  });
  return out;
}

export async function searchVivino(wine: Wine): Promise<Candidate[]> {
  const query = encodeURIComponent(wine.name.replace(/\d+[.,]\d*\s*(cl|l|ml)/gi, '').trim());
  const url = `https://www.vivino.com/search/wines?q=${query}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' } });
  if (!res.ok) throw new Error(`vivino:${res.status}`);
  return parseVivinoResults(await res.text());
}
