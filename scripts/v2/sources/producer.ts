import * as cheerio from 'cheerio';
import type { Wine, Candidate } from '../types';
import { extractProducerToken } from '../tokens';

export function parseProducerPage(html: string, pageUrl: string): Candidate[] {
  const $ = cheerio.load(html);
  const img = $('meta[property="og:image"]').attr('content');
  const title = $('title').text().trim();
  if (!img) return [];
  return [{
    imageUrl: img.startsWith('http') ? img : new URL(img, pageUrl).toString(),
    sourcePageUrl: pageUrl,
    sourcePageTitle: title,
    source: 'producer',
  }];
}

export async function searchProducer(wine: Wine): Promise<Candidate[]> {
  const producer = extractProducerToken(wine.name);
  if (!producer) return [];
  const guesses = [`https://www.${producer}.com`, `https://${producer}.com`, `https://www.${producer}.be`, `https://${producer}.fr`];
  for (const url of guesses) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) continue;
      const cands = parseProducerPage(await res.text(), url);
      if (cands.length > 0) return cands;
    } catch {}
  }
  return [];
}
