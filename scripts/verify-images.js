#!/usr/bin/env node
/**
 * Verifies that wine bottle image URLs are valid (return 200 + image content-type).
 * Usage: node scripts/verify-images.js [--batch N] [--start N] [--fix]
 *   --fix: re-search broken URLs via Bing and replace them
 */

const fs = require('fs');
const path = require('path');

const WINES_PATH = path.join(__dirname, '..', 'data', 'wines.ts');
const RESULTS_PATH = path.join(__dirname, 'image-results.json');
const VERIFY_PATH = path.join(__dirname, 'verify-results.json');
const DELAY_MS = 500; // faster since we're just HEAD-requesting
const SEARCH_DELAY_MS = 2000;
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function verifyUrl(url) {
  try {
    const resp = await fetch(url, {
      method: 'HEAD',
      headers: HEADERS,
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    });
    const contentType = resp.headers.get('content-type') || '';
    const isImage = contentType.startsWith('image/') || contentType.includes('octet-stream');
    return {
      ok: resp.status === 200 && isImage,
      status: resp.status,
      contentType,
    };
  } catch (err) {
    // Some servers block HEAD, try GET with range
    try {
      const resp = await fetch(url, {
        headers: { ...HEADERS, 'Range': 'bytes=0-0' },
        redirect: 'follow',
        signal: AbortSignal.timeout(10000),
      });
      const contentType = resp.headers.get('content-type') || '';
      const isImage = contentType.startsWith('image/') || contentType.includes('octet-stream');
      return {
        ok: (resp.status === 200 || resp.status === 206) && isImage,
        status: resp.status,
        contentType,
      };
    } catch (err2) {
      return { ok: false, status: 0, error: err2.message };
    }
  }
}

// Bing search for replacement images (same logic as fetch-images.js)
const BLOCKED_DOMAINS = [
  'pinterest.com', 'facebook.com', 'instagram.com', 'twitter.com',
  'youtube.com', 'tiktok.com', 'reddit.com', 'wikipedia.org',
  'stock', 'shutterstock', 'getty', 'alamy', 'dreamstime', 'istock',
  'clipart', 'vector', 'icon', 'emoji', 'karousell',
];

function cleanWineName(name) {
  return name
    .replace(/^(BEER|CIDRE|CIDER)\s+/i, '')
    .replace(/\d+[.,]\d*\s*(cl|l|ml)\b/gi, '')
    .replace(/\bMAGNUM\b/gi, '')
    .replace(/\bJEROBOAM\b/gi, '')
    .replace(/["''""«»]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toTitleCase(str) {
  if (str === str.toUpperCase() && str.length > 3) {
    return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }
  return str;
}

async function searchReplacement(wine) {
  let name = toTitleCase(cleanWineName(wine.name));
  const category = wine.category === 'sparkling' ? 'champagne' :
                   wine.category === 'beer' ? 'beer bottle' :
                   wine.category === 'cider' ? 'cider bottle' : 'wine bottle';
  const query = `${name} ${category}`;
  const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&first=1&count=10`;
  try {
    const resp = await fetch(url, { headers: HEADERS });
    if (resp.status !== 200) return null;
    const html = await resp.text();
    const murls = html.match(/murl&quot;:&quot;(https?:\/\/[^&"]+)/g) || [];
    const imageUrls = murls.map(m => m.replace('murl&quot;:&quot;', ''));
    // Filter and pick best
    const good = imageUrls.filter(u => {
      const lower = u.toLowerCase();
      return !BLOCKED_DOMAINS.some(d => lower.includes(d)) && !lower.match(/\.(svg|gif)($|\?)/);
    });
    return good[0] || null;
  } catch {
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const batchSize = parseInt(args.find((_, i, a) => a[i - 1] === '--batch') || '100');
  const startIdx = parseInt(args.find((_, i, a) => a[i - 1] === '--start') || '0');
  const fix = args.includes('--fix');

  const { wines } = require(WINES_PATH);
  const allResults = fs.existsSync(RESULTS_PATH) ? JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8')) : {};

  // Load previous verification results
  let verifyResults = {};
  if (fs.existsSync(VERIFY_PATH)) {
    verifyResults = JSON.parse(fs.readFileSync(VERIFY_PATH, 'utf8'));
    console.log(`Loaded ${Object.keys(verifyResults).length} existing verifications`);
  }

  // Only check wines that have images (status=found)
  const toVerify = wines.filter(w => allResults[w.id]?.status === 'found');
  console.log(`Total wines with images: ${toVerify.length}`);

  const batch = toVerify.slice(startIdx, startIdx + batchSize);
  console.log(`Verifying batch: index ${startIdx} to ${startIdx + batch.length - 1} (${batch.length} wines)\n`);

  let valid = 0, broken = 0, fixed = 0, cached = 0;

  for (let i = 0; i < batch.length; i++) {
    const wine = batch[i];
    const imageUrl = allResults[wine.id].image;

    // Skip if already verified OK
    if (verifyResults[wine.id]?.status === 'valid') {
      cached++;
      continue;
    }

    const result = await verifyUrl(imageUrl);

    if (result.ok) {
      verifyResults[wine.id] = { status: 'valid', url: imageUrl };
      console.log(`[${startIdx + i}] ✓ ${wine.name}`);
      valid++;
    } else {
      console.log(`[${startIdx + i}] ✗ BROKEN (${result.status} ${result.contentType || result.error || ''}): ${wine.name}`);
      console.log(`  URL: ${imageUrl}`);

      if (fix) {
        await sleep(SEARCH_DELAY_MS);
        const replacement = await searchReplacement(wine);
        if (replacement) {
          // Verify the replacement too
          const repCheck = await verifyUrl(replacement);
          if (repCheck.ok) {
            verifyResults[wine.id] = { status: 'fixed', url: replacement, oldUrl: imageUrl };
            allResults[wine.id].image = replacement;
            console.log(`  → FIXED: ${replacement.substring(0, 80)}...`);
            fixed++;
          } else {
            verifyResults[wine.id] = { status: 'broken', url: imageUrl, reason: `${result.status}` };
            broken++;
          }
        } else {
          verifyResults[wine.id] = { status: 'broken', url: imageUrl, reason: `${result.status}` };
          broken++;
        }
      } else {
        verifyResults[wine.id] = { status: 'broken', url: imageUrl, reason: `${result.status}` };
        broken++;
      }
    }

    if (i < batch.length - 1) await sleep(DELAY_MS);
  }

  // Save verification results
  fs.writeFileSync(VERIFY_PATH, JSON.stringify(verifyResults, null, 2));

  // If --fix, also save updated image-results and update wines.ts
  if (fix && fixed > 0) {
    fs.writeFileSync(RESULTS_PATH, JSON.stringify(allResults, null, 2));

    // Apply fixes to wines.ts
    let winesContent = fs.readFileSync(WINES_PATH, 'utf8');
    let updateCount = 0;
    for (const [id, vr] of Object.entries(verifyResults)) {
      if (vr.status === 'fixed') {
        const idIdx = winesContent.indexOf(`id: '${id}'`);
        if (idIdx > -1) {
          const imgIdx = winesContent.indexOf(`image: '`, idIdx);
          const imgEnd = winesContent.indexOf(`',`, imgIdx + 8);
          if (imgIdx > -1 && imgEnd > -1 && imgIdx - idIdx < 1000) {
            const oldLine = winesContent.substring(imgIdx, imgEnd + 2);
            if (oldLine.includes(vr.oldUrl)) {
              winesContent = winesContent.substring(0, imgIdx) + `image: '${vr.url}',` + winesContent.substring(imgEnd + 2);
              updateCount++;
            }
          }
        }
      }
    }
    if (updateCount > 0) {
      fs.writeFileSync(WINES_PATH, winesContent);
      console.log(`\nFixed ${updateCount} image URLs in wines.ts`);
    }
  }

  console.log(`\n--- Verification Summary ---`);
  console.log(`Valid: ${valid} | Broken: ${broken} | Fixed: ${fixed} | Cached: ${cached}`);
  console.log(`Results saved to ${VERIFY_PATH}`);
}

main().catch(console.error);
