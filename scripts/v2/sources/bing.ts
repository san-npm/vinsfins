import type { Wine, Candidate } from '../types';

export function parseBingResults(html: string): Candidate[] {
  const out: Candidate[] = [];
  const seen = new Set<string>();

  // Real Bing embeds JSON in HTML attributes with entity-encoded quotes.
  // Pattern: murl="URL" ...other fields... t="TITLE"
  // Fields between murl and t vary (turl, md5, shkey, etc.), so use a
  // bounded lazy match to tolerate them without crossing into the next entry.
  const entityRe = /murl&quot;:&quot;([^&]+)&quot;[\s\S]{0,600}?t&quot;:&quot;([^&]*)&quot;/g;
  let m: RegExpExecArray | null;
  while ((m = entityRe.exec(html)) !== null) {
    if (seen.has(m[1])) continue;
    seen.add(m[1]);
    out.push({
      imageUrl: m[1],
      sourcePageUrl: '',
      sourcePageTitle: m[2].replace(/\\"/g, '"'),
      source: 'bing',
    });
  }

  // Fallback: handle raw JSON form used by older fixtures and some response variants.
  const rawRe = /"murl":"([^"]+)","turl":"[^"]*","t":"([^"]*)"/g;
  while ((m = rawRe.exec(html)) !== null) {
    if (seen.has(m[1])) continue;
    seen.add(m[1]);
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
