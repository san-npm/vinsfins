#!/usr/bin/env node
/**
 * Retry image search for wines that still have Unsplash placeholders.
 */

const fs = require('fs');
const path = require('path');

const WINES_PATH = path.join(__dirname, '..', 'data', 'wines.ts');
const RESULTS_PATH = path.join(__dirname, 'image-results.json');
const DELAY_MS = 2500;
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml',
  'Accept-Language': 'en-US,en;q=0.9',
};

const BLOCKED_DOMAINS = [
  'pinterest.com', 'facebook.com', 'instagram.com', 'twitter.com',
  'youtube.com', 'tiktok.com', 'reddit.com', 'wikipedia.org',
  'stock', 'shutterstock', 'getty', 'alamy', 'dreamstime', 'istock',
  'clipart', 'vector', 'icon', 'emoji', 'karousell',
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function cleanName(name) {
  return name
    .replace(/^(BEER|CIDRE|CIDER)\s+/i, '')
    .replace(/\d+[.,]\d*\s*(cl|l|ml)\b/gi, '')
    .replace(/\bMAGNUM\b/gi, '')
    .replace(/\bJEROBOAM\b/gi, '')
    .replace(/["''""«»]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toTitle(s) {
  if (s === s.toUpperCase() && s.length > 3)
    return s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  return s;
}

function scoreUrl(url, wine) {
  const lower = url.toLowerCase();
  for (const d of BLOCKED_DOMAINS) { if (lower.includes(d)) return 0; }
  if (lower.match(/\.(svg|gif)($|\?)/)) return 0;
  let score = 50;
  if (lower.match(/wine|vin|vino|bottle|cave|cellar|shop/)) score += 20;
  const sizeMatch = url.match(/(\d+)x(\d+)/);
  if (sizeMatch && (parseInt(sizeMatch[1]) >= 600 || parseInt(sizeMatch[2]) >= 600)) score += 15;
  if (lower.match(/\.(jpg|jpeg|png)($|\?)/)) score += 10;
  const nameWords = cleanName(wine.name).toLowerCase().split(/\s+/).filter(w => w.length > 3);
  score += nameWords.filter(w => lower.includes(w)).length * 10;
  return score;
}

async function searchBing(query, retries = 2) {
  const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&first=1&count=15`;
  const resp = await fetch(url, { headers: HEADERS });
  if (resp.status === 429 && retries > 0) {
    console.log('  ⏳ Rate limited, waiting 15s...');
    await sleep(15000);
    return searchBing(query, retries - 1);
  }
  if (resp.status !== 200) return [];
  const html = await resp.text();
  const murls = html.match(/murl&quot;:&quot;(https?:\/\/[^&"]+)/g) || [];
  return murls.map(m => m.replace('murl&quot;:&quot;', ''));
}

async function findImage(wine) {
  const name = toTitle(cleanName(wine.name));
  const category = wine.category === 'sparkling' ? 'champagne' :
                   wine.category === 'cider' ? 'cider' : 'wine';

  // Try multiple query variations
  const queries = [
    `${name} ${category} bottle`,
    `${name} ${category}`,
  ];

  // If name has clear producer (first word), try producer + key words
  const words = name.split(/\s+/);
  if (words.length >= 3) {
    queries.push(`${words[0]} ${words.slice(-2).join(' ')} ${category}`);
  }

  for (const q of queries) {
    const images = await searchBing(q);
    const scored = images
      .map(u => ({ url: u, score: scoreUrl(u, wine) }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score);

    if (scored.length > 0) {
      return { url: scored[0].url, query: q, score: scored[0].score };
    }
    await sleep(DELAY_MS);
  }
  return null;
}

async function main() {
  const { wines } = require(WINES_PATH);
  const allResults = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));

  const missing = wines.filter(w => w.image.includes('unsplash.com'));
  console.log(`Retrying ${missing.length} wines with placeholder images\n`);

  let found = 0, notFound = 0;

  for (let i = 0; i < missing.length; i++) {
    const wine = missing[i];
    const result = await findImage(wine);

    if (result) {
      allResults[wine.id] = {
        id: wine.id,
        status: 'found',
        query: result.query,
        image: result.url,
        score: result.score,
      };
      console.log(`[${i}] ✓ ${wine.name} → ${result.url.substring(0, 70)}...`);
      found++;
    } else {
      console.log(`[${i}] ✗ ${wine.name}`);
      notFound++;
    }

    if (i < missing.length - 1) await sleep(DELAY_MS);
  }

  // Save results
  fs.writeFileSync(RESULTS_PATH, JSON.stringify(allResults, null, 2));

  // Apply to wines.ts
  let content = fs.readFileSync(WINES_PATH, 'utf8');
  let updated = 0;
  for (const wine of missing) {
    const r = allResults[wine.id];
    if (r?.status === 'found' && r.image) {
      const idIdx = content.indexOf(`id: '${wine.id}'`);
      if (idIdx > -1) {
        const imgIdx = content.indexOf(`image: '`, idIdx);
        const imgEnd = content.indexOf(`',`, imgIdx + 8);
        if (imgIdx > -1 && imgEnd > -1 && imgIdx - idIdx < 1000) {
          content = content.substring(0, imgIdx) + `image: '${r.image}',` + content.substring(imgEnd + 2);
          updated++;
        }
      }
    }
  }
  if (updated > 0) {
    fs.writeFileSync(WINES_PATH, content);
    console.log(`\nUpdated ${updated} images in wines.ts`);
  }

  console.log(`\n--- Summary ---`);
  console.log(`Found: ${found} | Not found: ${notFound}`);
}

main().catch(console.error);
