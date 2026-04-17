import type { Wine, Candidate } from '../types';

export function parseBingResults(html: string): Candidate[] {
  const out: Candidate[] = [];
  const re = /"murl":"([^"]+)","turl":"[^"]*","t":"([^"]*)"/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    out.push({
      imageUrl: m[1],
      sourcePageUrl: '',
      sourcePageTitle: m[2].replace(/\\"/g, '"'),
      source: 'bing',
    });
  }
  return out;
}

export async function searchBing(wine: Wine): Promise<Candidate[]> {
  const category = wine.category === 'sparkling' ? 'champagne' : `${wine.category} bottle`;
  const q = encodeURIComponent(`${wine.name} ${category}`.replace(/\d+[.,]\d*\s*(cl|l|ml)/gi, '').trim());
  const url = `https://www.bing.com/images/search?q=${q}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });
  if (!res.ok) throw new Error(`bing:${res.status}`);
  return parseBingResults(await res.text());
}
