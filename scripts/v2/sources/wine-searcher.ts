import * as cheerio from 'cheerio';
import type { Wine, Candidate } from '../types';

export function parseWineSearcherResults(html: string): Candidate[] {
  const $ = cheerio.load(html);
  const out: Candidate[] = [];
  $('.wine-item, .wine-card, [class*="WineItem"]').each((_, el) => {
    const card = $(el);
    const img = card.find('img').first();
    const src = img.attr('src') || img.attr('data-src') || '';
    const title = img.attr('alt') || card.find('h2,h3,.wine-name').first().text().trim();
    const link = card.find('a').first().attr('href') || '';
    if (!src || src.startsWith('data:')) return;
    out.push({
      imageUrl: src.startsWith('http') ? src : `https://www.wine-searcher.com${src}`,
      sourcePageUrl: link.startsWith('http') ? link : `https://www.wine-searcher.com${link}`,
      sourcePageTitle: title,
      source: 'wine-searcher',
    });
  });
  return out;
}

export async function searchWineSearcher(wine: Wine): Promise<Candidate[]> {
  const query = encodeURIComponent(wine.name.replace(/\d+[.,]\d*\s*(cl|l|ml)/gi, '').trim());
  const url = `https://www.wine-searcher.com/find/${query}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`wine-searcher:${res.status}`);
  return parseWineSearcherResults(await res.text());
}
