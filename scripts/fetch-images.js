#!/usr/bin/env node
/**
 * Fetches real bottle images via Bing Image Search.
 * Usage: node scripts/fetch-images.js [--batch N] [--start N] [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const WINES_PATH = path.join(__dirname, '..', 'data', 'wines.ts');
const RESULTS_PATH = path.join(__dirname, 'image-results.json');
const DELAY_MS = 2000;
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml',
  'Accept-Language': 'en-US,en;q=0.9',
};

// Preferred domains for wine bottle images (in order of preference)
const PREFERRED_DOMAINS = [
  'vivino.com', 'wine-searcher.com', 'wineyou.it', 'naturalwine.com',
  'fytwine.com', 'coolvines.com', 'bigcommerce.com', 'shopify.com',
  'woocommerce', 'wp-content', 'wine', 'vin', 'cellar',
];

// Domains to avoid (generic, low quality, or unrelated)
const BLOCKED_DOMAINS = [
  'pinterest.com', 'facebook.com', 'instagram.com', 'twitter.com',
  'youtube.com', 'tiktok.com', 'reddit.com', 'wikipedia.org',
  'stock', 'shutterstock', 'getty', 'alamy', 'dreamstime', 'istock',
  'clipart', 'vector', 'icon', 'emoji', 'karousell',
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function cleanWineName(name) {
  return name
    .replace(/^(BEER|CIDRE|CIDER)\s+/i, '')
    .replace(/\d+[.,]\d*\s*(cl|l|ml)\b/gi, '')
    .replace(/["''""«»]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildSearchQuery(wine) {
  const name = cleanWineName(wine.name);
  // Add "wine bottle" to help focus results
  const category = wine.category === 'sparkling' ? 'champagne' :
                   wine.category === 'beer' ? 'beer bottle' :
                   wine.category === 'cider' ? 'cider bottle' : 'wine bottle';
  return `${name} ${category}`;
}

function scoreImageUrl(url, wine) {
  const lower = url.toLowerCase();
  let score = 50; // base score

  // Prefer URLs from wine-related domains
  for (const domain of PREFERRED_DOMAINS) {
    if (lower.includes(domain)) { score += 20; break; }
  }

  // Block unwanted domains
  for (const domain of BLOCKED_DOMAINS) {
    if (lower.includes(domain)) return 0;
  }

  // Prefer larger images
  const sizeMatch = url.match(/(\d+)x(\d+)/);
  if (sizeMatch) {
    const w = parseInt(sizeMatch[1]);
    const h = parseInt(sizeMatch[2]);
    if (w >= 600 || h >= 600) score += 15;
    else if (w >= 300 || h >= 300) score += 5;
    if (w < 100 || h < 100) return 0; // too small
  }

  // Prefer jpg/png over other formats
  if (lower.match(/\.(jpg|jpeg|png)($|\?)/)) score += 10;
  if (lower.match(/\.(webp)($|\?)/)) score += 5;
  if (lower.match(/\.(svg|gif)($|\?)/)) return 0;

  // Check if wine name words appear in the URL (good relevance signal)
  const nameWords = cleanWineName(wine.name).toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const urlMatches = nameWords.filter(w => lower.includes(w));
  score += urlMatches.length * 10;

  return score;
}

async function searchBingImages(query, retries = 2) {
  const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&first=1&count=10`;
  try {
    const resp = await fetch(url, { headers: HEADERS });
    if (resp.status === 429 && retries > 0) {
      console.log(`  ⏳ Rate limited, waiting 15s...`);
      await sleep(15000);
      return searchBingImages(query, retries - 1);
    }
    if (resp.status !== 200) {
      return { error: `HTTP ${resp.status}` };
    }
    const html = await resp.text();

    // Extract media URLs from Bing results
    const murls = html.match(/murl&quot;:&quot;(https?:\/\/[^&"]+)/g) || [];
    const imageUrls = murls.map(m => m.replace('murl&quot;:&quot;', ''));

    return { images: imageUrls };
  } catch (err) {
    return { error: err.message };
  }
}

async function processWine(wine) {
  if (['beer', 'cider'].includes(wine.category)) {
    // Still try for beers/ciders but with specific queries
  }

  const query = buildSearchQuery(wine);
  const { images, error } = await searchBingImages(query);

  if (error) {
    return { id: wine.id, status: 'error', error, query };
  }

  if (!images || images.length === 0) {
    return { id: wine.id, status: 'not_found', query };
  }

  // Score and pick the best image
  const scored = images
    .map(url => ({ url, score: scoreImageUrl(url, wine) }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return { id: wine.id, status: 'not_found', query };
  }

  return {
    id: wine.id,
    status: 'found',
    query,
    image: scored[0].url,
    score: scored[0].score,
    alternatives: scored.slice(1, 3).map(s => s.url),
  };
}

async function applyResults(allResults, wines) {
  const winesContent = fs.readFileSync(WINES_PATH, 'utf8');
  let updated = winesContent;
  let updateCount = 0;

  for (const wine of wines) {
    const result = allResults[wine.id];
    if (result?.status === 'found' && result.image) {
      if (wine.image && wine.image.includes('unsplash.com')) {
        const idIdx = updated.indexOf(`id: '${wine.id}'`);
        if (idIdx > -1) {
          const imgIdx = updated.indexOf(`image: '`, idIdx);
          const imgEnd = updated.indexOf(`',`, imgIdx + 8);
          if (imgIdx > -1 && imgEnd > -1 && imgIdx - idIdx < 1000) {
            const before = updated.substring(0, imgIdx);
            const after = updated.substring(imgEnd + 2);
            updated = before + `image: '${result.image}',` + after;
            updateCount++;
          }
        }
      }
    }
  }

  if (updateCount > 0) {
    fs.writeFileSync(WINES_PATH, updated);
    console.log(`Updated ${updateCount} wine images in wines.ts`);
  } else {
    console.log('No images to update in wines.ts');
  }
}

async function main() {
  const args = process.argv.slice(2);
  const batchSize = parseInt(args.find((_, i, a) => a[i - 1] === '--batch') || '100');
  const startIdx = parseInt(args.find((_, i, a) => a[i - 1] === '--start') || '0');
  const dryRun = args.includes('--dry-run');

  const { wines } = require(WINES_PATH);
  console.log(`Total wines: ${wines.length}`);

  // Load existing results
  let allResults = {};
  if (fs.existsSync(RESULTS_PATH)) {
    allResults = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));
    console.log(`Loaded ${Object.keys(allResults).length} existing results`);
  }

  const batch = wines.slice(startIdx, startIdx + batchSize);
  console.log(`Processing batch: index ${startIdx} to ${startIdx + batch.length - 1} (${batch.length} wines)\n`);

  let found = 0, notFound = 0, errors = 0, cached = 0;

  for (let i = 0; i < batch.length; i++) {
    const wine = batch[i];

    // Skip if already found
    if (allResults[wine.id]?.status === 'found') {
      cached++;
      continue;
    }

    const result = await processWine(wine);
    allResults[wine.id] = result;

    const icon = result.status === 'found' ? '✓' : result.status === 'error' ? '⚠' : '✗';
    const suffix = result.image ? ` → ${result.image.substring(0, 80)}...` : '';
    console.log(`[${startIdx + i}] ${icon} ${result.status}: ${wine.name}${suffix}`);

    switch (result.status) {
      case 'found': found++; break;
      case 'not_found': notFound++; break;
      case 'error': errors++; break;
    }

    if (i < batch.length - 1) await sleep(DELAY_MS);
  }

  // Save results
  fs.writeFileSync(RESULTS_PATH, JSON.stringify(allResults, null, 2));

  console.log(`\n--- Batch Summary ---`);
  console.log(`Found: ${found} | Not found: ${notFound} | Errors: ${errors} | Cached: ${cached}`);
  console.log(`Total results saved: ${Object.keys(allResults).length}`);

  if (!dryRun) {
    await applyResults(allResults, wines);
  } else {
    console.log('Dry run — no changes written to wines.ts');
  }
}

main().catch(console.error);
