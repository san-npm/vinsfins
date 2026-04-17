# Vins Fins Image Rescrape v2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Bing-scraped bottle images with a validated, multi-source, human-in-loop pipeline that produces consistent 800×1200 portrait images on Vercel Blob for all 730 wines.

**Architecture:** Four-stage pipeline (audit → waterfall → classify → apply) with a dev-only Next.js review UI between classify and apply. State between stages is JSON files under `scripts/v2/state/`; every stage is resumable. Validation rejects mis-matched images by requiring a producer-token hit plus wine-name token overlap; anything not HIGH-confidence goes to human review.

**Tech Stack:** TypeScript, Next.js 14 App Router (already in repo), `sharp` for image processing (already installed), `@vercel/blob` (already installed), `vitest` for tests (to be added), `cheerio` for HTML parsing (to be added), `tsx` to run scripts.

**Spec:** [docs/superpowers/specs/2026-04-17-vinsfins-image-rescrape-design.md](../specs/2026-04-17-vinsfins-image-rescrape-design.md)

---

## File Structure

All new code under `scripts/v2/` except the review UI which lives under `app/admin/image-review/` per Next.js App Router convention.

```
scripts/v2/
├── orchestrate.ts                  # CLI entry point
├── types.ts                        # Wine, Candidate, AuditRecord, Classification types
├── state.ts                        # readState/writeState helpers
├── tokens.ts                       # extractProducerToken, extractWineTokens
├── validate.ts                     # confidence scoring
├── corner-variance.ts              # heuristic for "clean background"
├── normalize.ts                    # fetch + resize to 800×1200 white JPG
├── blob-upload.ts                  # upload + delete wrapper
├── audit.ts                        # stage 1
├── sources/
│   ├── index.ts                    # source registry
│   ├── vivino.ts
│   ├── wine-searcher.ts
│   ├── producer.ts
│   └── bing.ts
├── waterfall.ts                    # stage 2
├── classify.ts                     # stage 3
├── apply.ts                        # stage 5
└── state/                          # (gitignored except .gitkeep)
    ├── audit.json
    ├── candidates.json
    ├── classified.json
    ├── decisions.json
    └── source-health.json

tests/v2/
├── fixtures/                       # saved HTML pages for source tests
├── tokens.test.ts
├── validate.test.ts
├── corner-variance.test.ts
├── normalize.test.ts
├── sources/
│   ├── vivino.test.ts
│   ├── wine-searcher.test.ts
│   ├── producer.test.ts
│   └── bing.test.ts
├── waterfall.test.ts
├── classify.test.ts
├── apply.test.ts
└── integration/
    └── waterfall.int.test.ts      # gated behind RUN_INTEGRATION=1

app/admin/image-review/
├── page.tsx                        # review UI
└── api/decide/route.ts             # POST handler
```

`data/wines.ts` is modified only by the apply stage.

---

## Task 1: Project setup — test framework and deps

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `tests/v2/.gitkeep`
- Create: `scripts/v2/.gitkeep`
- Create: `scripts/v2/state/.gitignore`

- [ ] **Step 1: Install dev dependencies**

Run:
```
npm install --save-dev vitest @vitest/ui cheerio @types/cheerio tsx
```

- [ ] **Step 2: Add test scripts to package.json**

Edit `package.json` `scripts`:
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:int": "RUN_INTEGRATION=1 vitest run tests/v2/integration"
}
```

- [ ] **Step 3: Create vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/v2/integration/**', 'node_modules/**'],
    testTimeout: 10_000,
  },
});
```

- [ ] **Step 4: Create gitignore for state files**

Write `scripts/v2/state/.gitignore`:
```
*.json
!.gitignore
```

- [ ] **Step 5: Verify test runner works**

Create `tests/v2/smoke.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
describe('smoke', () => { it('runs', () => expect(1 + 1).toBe(2)); });
```

Run: `npm test`
Expected: 1 test passes.

- [ ] **Step 6: Delete smoke test and commit**

```
rm tests/v2/smoke.test.ts
git add package.json package-lock.json vitest.config.ts tests/v2/.gitkeep scripts/v2/.gitkeep scripts/v2/state/.gitignore
git commit -m "chore: add vitest, cheerio, tsx; scaffold scripts/v2"
```

---

## Task 2: Shared types

**Files:**
- Create: `scripts/v2/types.ts`

- [ ] **Step 1: Write the types file**

```ts
// scripts/v2/types.ts

export interface Wine {
  id: string;
  name: string;
  region: string;
  country: string;
  grape: string;
  category: 'red' | 'white' | 'orange' | 'sparkling' | 'beer' | 'cider';
  image: string;
}

export interface Candidate {
  imageUrl: string;
  sourcePageUrl: string;
  sourcePageTitle: string;
  source: 'vivino' | 'wine-searcher' | 'producer' | 'bing';
  width?: number;
  height?: number;
}

export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

export interface ValidationResult {
  confidence: Confidence;
  reasons: string[];
  metrics: {
    aspectRatio?: number;
    minSide?: number;
    producerTokenHit: boolean;
    wineTokenCount: number;
    domainAllowed: boolean;
    domainBlocked: boolean;
    cornerVariance?: number;
  };
}

export interface AuditRecord {
  wineId: string;
  currentImageUrl: string;
  result: ValidationResult | { confidence: 'NONE'; reasons: ['fetch-failed']; metrics: any };
  passed: boolean;
}

export interface ClassifiedRecord {
  wineId: string;
  decision: 'keep' | 'auto-accept' | 'flag';
  chosen?: Candidate & { validation: ValidationResult };
  candidates: Array<Candidate & { validation: ValidationResult }>;
}

export interface Decision {
  wineId: string;
  action: 'accept' | 'pasted-url' | 'placeholder' | 'skip';
  imageUrl?: string;
  pastedUrl?: string;
  placeholderCategory?: string;
  timestamp: number;
}
```

- [ ] **Step 2: Commit**

```
git add scripts/v2/types.ts
git commit -m "feat(v2): shared types for audit/candidate/classification"
```

---

## Task 3: State read/write helpers

**Files:**
- Create: `scripts/v2/state.ts`
- Create: `tests/v2/state.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/v2/state.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { readState, writeState } from '../../scripts/v2/state';

describe('state', () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'v2-state-'));
  });

  it('returns empty array when file missing', () => {
    expect(readState<number>(join(dir, 'missing.json'))).toEqual([]);
  });

  it('round-trips data', () => {
    const path = join(dir, 'data.json');
    writeState(path, [1, 2, 3]);
    expect(readState<number>(path)).toEqual([1, 2, 3]);
    rmSync(dir, { recursive: true });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- state`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement state.ts**

```ts
// scripts/v2/state.ts
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

export function readState<T>(path: string): T[] {
  if (!existsSync(path)) return [];
  return JSON.parse(readFileSync(path, 'utf-8')) as T[];
}

export function writeState<T>(path: string, data: T[]): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- state`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```
git add scripts/v2/state.ts tests/v2/state.test.ts
git commit -m "feat(v2): state read/write helpers"
```

---

## Task 4: Token extraction (producer + wine-name tokens)

**Files:**
- Create: `scripts/v2/tokens.ts`
- Create: `tests/v2/tokens.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// tests/v2/tokens.test.ts
import { describe, it, expect } from 'vitest';
import { extractProducerToken, extractWineTokens } from '../../scripts/v2/tokens';

describe('extractProducerToken', () => {
  it('prefers ALL-CAPS token of length >= 4', () => {
    expect(extractProducerToken("BEER WoopWoop sous voile ANTIDOOT 0,75cl")).toBe('antidoot');
  });

  it('falls back to longest significant token if no ALL-CAPS', () => {
    expect(extractProducerToken("Domaine Gramenon La Sagesse 2022")).toBe('gramenon');
  });

  it('returns null for unrecognizable names', () => {
    expect(extractProducerToken("Pinot Noir 2019")).toBeNull();
  });
});

describe('extractWineTokens', () => {
  it('strips stopwords, producer token, years, volumes', () => {
    const tokens = extractWineTokens("BEER WoopWoop sous voile ANTIDOOT 0,75cl", 'antidoot');
    expect(tokens).toContain('woopwoop');
    expect(tokens).toContain('voile');
    expect(tokens).not.toContain('beer');
    expect(tokens).not.toContain('antidoot');
    expect(tokens).not.toContain('0,75cl');
  });

  it('lowercases and removes non-word chars', () => {
    expect(extractWineTokens("L'Ambigu Riesling", null)).toEqual(['ambigu', 'riesling']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tokens`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement tokens.ts**

```ts
// scripts/v2/tokens.ts

const STOPWORDS = new Set([
  'beer', 'cider', 'wine', 'bottle', 'vin', 'de', 'du', 'la', 'le', 'les',
  'the', 'a', 'an', 'of', 'and', 'et', 'sous', 'voile',
  'magnum', 'jeroboam', 'cl', 'l', 'ml',
]);

const VOLUME_RE = /^\d+[.,]?\d*(cl|l|ml)$/i;
const YEAR_RE = /^(19|20)\d{2}$/;

function splitTokens(s: string): string[] {
  return s
    .replace(/[''""«»""''`]/g, ' ')
    .replace(/[^a-zA-ZÀ-ÿ0-9\s,.']/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

export function extractProducerToken(wineName: string): string | null {
  const raw = splitTokens(wineName);
  const allCaps = raw.find(
    (t) => t.length >= 4 && t === t.toUpperCase() && /[A-Z]/.test(t) && !VOLUME_RE.test(t)
  );
  if (allCaps) return allCaps.toLowerCase();

  const significant = raw
    .map((t) => t.toLowerCase())
    .filter(
      (t) =>
        t.length >= 4 &&
        !STOPWORDS.has(t) &&
        !VOLUME_RE.test(t) &&
        !YEAR_RE.test(t) &&
        !/^\d/.test(t)
    );
  if (significant.length === 0) return null;
  return significant.sort((a, b) => b.length - a.length)[0];
}

export function extractWineTokens(wineName: string, producerToken: string | null): string[] {
  return splitTokens(wineName)
    .map((t) => t.toLowerCase())
    .filter(
      (t) =>
        t.length >= 3 &&
        !STOPWORDS.has(t) &&
        !VOLUME_RE.test(t) &&
        !YEAR_RE.test(t) &&
        t !== producerToken
    );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tokens`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```
git add scripts/v2/tokens.ts tests/v2/tokens.test.ts
git commit -m "feat(v2): producer and wine-name token extraction"
```

---

## Task 5: Corner-variance heuristic

**Files:**
- Create: `scripts/v2/corner-variance.ts`
- Create: `tests/v2/corner-variance.test.ts`
- Create: `tests/v2/fixtures/clean-bottle.jpg` (synthetic — see below)
- Create: `tests/v2/fixtures/busy-background.jpg`

- [ ] **Step 1: Generate fixture images using sharp**

Run this one-off via `tsx`:
```
mkdir -p tests/v2/fixtures
npx tsx -e "import sharp from 'sharp'; const clean = Buffer.from(Array(800*1200*3).fill(255)); for (let y=0;y<1200;y++) for (let x=250;x<550;x++){const i=(y*800+x)*3;clean[i]=40;clean[i+1]=30;clean[i+2]=20;} sharp(clean, {raw:{width:800,height:1200,channels:3}}).jpeg().toFile('tests/v2/fixtures/clean-bottle.jpg'); const busy = Buffer.from(Array.from({length:800*1200*3},()=>Math.floor(Math.random()*255))); sharp(busy, {raw:{width:800,height:1200,channels:3}}).jpeg().toFile('tests/v2/fixtures/busy-background.jpg');"
```

- [ ] **Step 2: Write the failing test**

```ts
// tests/v2/corner-variance.test.ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { cornerVariance } from '../../scripts/v2/corner-variance';

describe('cornerVariance', () => {
  it('returns low variance for clean white-corner image', async () => {
    const buf = readFileSync(join(__dirname, 'fixtures/clean-bottle.jpg'));
    const v = await cornerVariance(buf);
    expect(v).toBeLessThan(0.15);
  });

  it('returns high variance for busy background', async () => {
    const buf = readFileSync(join(__dirname, 'fixtures/busy-background.jpg'));
    const v = await cornerVariance(buf);
    expect(v).toBeGreaterThan(0.15);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- corner-variance`
Expected: FAIL — module not found.

- [ ] **Step 4: Implement corner-variance.ts**

```ts
// scripts/v2/corner-variance.ts
import sharp from 'sharp';

const PATCH = 50;

export async function cornerVariance(imageBuffer: Buffer): Promise<number> {
  const img = sharp(imageBuffer);
  const { width, height } = await img.metadata();
  if (!width || !height || width < PATCH * 2 || height < PATCH * 2) return 1;

  const corners = [
    { left: 0, top: 0 },
    { left: width - PATCH, top: 0 },
    { left: 0, top: height - PATCH },
    { left: width - PATCH, top: height - PATCH },
  ];

  let totalStdDev = 0;
  for (const c of corners) {
    const { data } = await sharp(imageBuffer)
      .extract({ ...c, width: PATCH, height: PATCH })
      .raw()
      .toBuffer({ resolveWithObject: true });
    const values = Array.from(data);
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
    totalStdDev += Math.sqrt(variance) / 255;
  }
  return totalStdDev / 4;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- corner-variance`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```
git add scripts/v2/corner-variance.ts tests/v2/corner-variance.test.ts tests/v2/fixtures/clean-bottle.jpg tests/v2/fixtures/busy-background.jpg
git commit -m "feat(v2): corner-variance heuristic for clean-background detection"
```

---

## Task 6: Validation function

**Files:**
- Create: `scripts/v2/validate.ts`
- Create: `tests/v2/validate.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// tests/v2/validate.test.ts
import { describe, it, expect } from 'vitest';
import { scoreCandidate, WINE_RETAILER_DOMAINS } from '../../scripts/v2/validate';

const antidootWine = {
  id: 'beer-woopwoop-sous-voile-antidoot-0-75cl',
  name: 'BEER WoopWoop sous voile ANTIDOOT 0,75cl',
  region: '', country: 'Belgium', grape: 'Craft brew',
  category: 'beer' as const,
  image: '',
};

describe('scoreCandidate', () => {
  it('rejects Voodoo Ranger (no producer token, blocked visual cues)', () => {
    const r = scoreCandidate(antidootWine, {
      imageUrl: 'https://cdn.shopify.com/s/files/x/Vootique_HerowithBottle_Blue.jpg',
      sourcePageUrl: 'https://shopify.com/x',
      sourcePageTitle: 'New Belgium Voodoo Ranger IPA',
      source: 'bing',
      width: 4472, height: 4472,
    });
    expect(r.confidence).toBe('NONE');
  });

  it('returns HIGH or MEDIUM for portrait vivino hit with producer + wine tokens', () => {
    const r = scoreCandidate(antidootWine, {
      imageUrl: 'https://images.vivino.com/thumbs/antidoot-woopwoop-sous-voile_x600.png',
      sourcePageUrl: 'https://www.vivino.com/antidoot-woopwoop-sous-voile',
      sourcePageTitle: 'Antidoot WoopWoop sous voile',
      source: 'vivino',
      width: 600, height: 900,
    });
    expect(r.metrics.producerTokenHit).toBe(true);
    expect(r.metrics.wineTokenCount).toBeGreaterThanOrEqual(2);
    expect(['HIGH', 'MEDIUM']).toContain(r.confidence);
  });

  it('returns NONE when aspect is wrong', () => {
    const r = scoreCandidate(antidootWine, {
      imageUrl: 'https://vivino.com/antidoot-woopwoop.jpg',
      sourcePageUrl: '', sourcePageTitle: 'Antidoot WoopWoop voile',
      source: 'vivino',
      width: 1200, height: 800,
    });
    expect(r.confidence).toBe('NONE');
  });

  it('returns NONE for blocked domain', () => {
    const r = scoreCandidate(antidootWine, {
      imageUrl: 'https://pinterest.com/pin/x.jpg',
      sourcePageUrl: '', sourcePageTitle: 'Antidoot WoopWoop voile',
      source: 'bing',
      width: 600, height: 900,
    });
    expect(r.confidence).toBe('NONE');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- validate`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement validate.ts**

```ts
// scripts/v2/validate.ts
import type { Wine, Candidate, ValidationResult } from './types';
import { extractProducerToken, extractWineTokens } from './tokens';

export const WINE_RETAILER_DOMAINS = [
  'vivino.com', 'images.vivino.com',
  'wine-searcher.com', 'img.wine-searcher.com',
  'bodeboca.com', 'millesima.com', 'plonk.com',
  'naturalwine.com', 'coolvines.com',
  'lieu-dit.dk', 'more-than-wine.com',
];

export const BLOCKED_DOMAINS = [
  'pinterest.com', 'facebook.com', 'instagram.com', 'twitter.com', 'x.com',
  'youtube.com', 'tiktok.com', 'reddit.com', 'wikipedia.org',
  'shutterstock', 'getty', 'alamy', 'dreamstime', 'istock',
];

function hostOf(url: string): string {
  try { return new URL(url).hostname.toLowerCase(); }
  catch { return ''; }
}

export function scoreCandidate(
  wine: Wine,
  cand: Candidate,
  cornerVar?: number
): ValidationResult {
  const reasons: string[] = [];
  const producer = extractProducerToken(wine.name);
  const wineTokens = extractWineTokens(wine.name, producer);

  const aspectRatio = cand.width && cand.height ? cand.height / cand.width : undefined;
  const minSide = cand.width && cand.height ? Math.min(cand.width, cand.height) : undefined;
  const haystack = (cand.imageUrl + ' ' + cand.sourcePageUrl + ' ' + cand.sourcePageTitle).toLowerCase();

  const producerTokenHit = producer ? haystack.includes(producer) : false;
  const wineTokenCount = wineTokens.filter((t) => haystack.includes(t)).length;

  const host = hostOf(cand.imageUrl);
  const domainAllowed = WINE_RETAILER_DOMAINS.some((d) => host.endsWith(d));
  const domainBlocked = BLOCKED_DOMAINS.some((d) => host.includes(d));

  const metrics = { aspectRatio, minSide, producerTokenHit, wineTokenCount, domainAllowed, domainBlocked, cornerVariance: cornerVar };

  if (domainBlocked) { reasons.push('blocked-domain'); return { confidence: 'NONE', reasons, metrics }; }
  if (!aspectRatio || aspectRatio < 1.3) { reasons.push('bad-aspect'); return { confidence: 'NONE', reasons, metrics }; }
  if (!minSide || minSide < 600) { reasons.push('too-small'); return { confidence: 'NONE', reasons, metrics }; }
  if (!producerTokenHit && wineTokenCount === 0) { reasons.push('no-token-match'); return { confidence: 'NONE', reasons, metrics }; }

  const hardSignals = [producerTokenHit, wineTokenCount >= 2, domainAllowed, cornerVar === undefined || cornerVar < 0.15];
  const passing = hardSignals.filter(Boolean).length;

  if (passing === 4) { reasons.push('all-signals-pass'); return { confidence: 'HIGH', reasons, metrics }; }
  if (producerTokenHit && passing >= 3) { reasons.push('one-signal-miss'); return { confidence: 'MEDIUM', reasons, metrics }; }
  if (producerTokenHit || wineTokenCount >= 1) { reasons.push('weak-match'); return { confidence: 'LOW', reasons, metrics }; }
  reasons.push('insufficient-signals');
  return { confidence: 'NONE', reasons, metrics };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- validate`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```
git add scripts/v2/validate.ts tests/v2/validate.test.ts
git commit -m "feat(v2): candidate validation with confidence scoring"
```

---

## Task 7: Normalize pipeline

**Files:**
- Create: `scripts/v2/normalize.ts`
- Create: `tests/v2/normalize.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/v2/normalize.test.ts
import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { normalizeToPortrait } from '../../scripts/v2/normalize';

describe('normalizeToPortrait', () => {
  it('outputs 800x1200 JPEG with white padding for square source', async () => {
    const square = await sharp({ create: { width: 500, height: 500, channels: 3, background: '#c33' } }).jpeg().toBuffer();
    const out = await normalizeToPortrait(square);
    const meta = await sharp(out).metadata();
    expect(meta.width).toBe(800);
    expect(meta.height).toBe(1200);
    expect(meta.format).toBe('jpeg');
  });

  it('preserves aspect when source is already portrait', async () => {
    const tall = await sharp({ create: { width: 600, height: 900, channels: 3, background: '#3c3' } }).jpeg().toBuffer();
    const out = await normalizeToPortrait(tall);
    const meta = await sharp(out).metadata();
    expect(meta.width).toBe(800);
    expect(meta.height).toBe(1200);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- normalize`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement normalize.ts**

```ts
// scripts/v2/normalize.ts
import sharp from 'sharp';

const TARGET_W = 800;
const TARGET_H = 1200;

export async function normalizeToPortrait(inputBuffer: Buffer): Promise<Buffer> {
  return sharp(inputBuffer)
    .resize(TARGET_W, TARGET_H, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();
}

export async function fetchImage(url: string, timeoutMs = 15_000): Promise<Buffer> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  const res = await fetch(url, {
    signal: controller.signal,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VinsFins/2.0)' },
  });
  clearTimeout(t);
  if (!res.ok) throw new Error(`fetch-failed:${res.status}`);
  const ct = res.headers.get('content-type') || '';
  if (!ct.startsWith('image/')) throw new Error(`not-an-image:${ct}`);
  return Buffer.from(await res.arrayBuffer());
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- normalize`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```
git add scripts/v2/normalize.ts tests/v2/normalize.test.ts
git commit -m "feat(v2): normalize images to 800x1200 white JPEG"
```

---

## Task 8: Blob upload wrapper

**Files:**
- Create: `scripts/v2/blob-upload.ts`

No unit test — `@vercel/blob` requires network + token. Verified at integration time.

- [ ] **Step 1: Implement blob-upload.ts**

```ts
// scripts/v2/blob-upload.ts
import { put, del } from '@vercel/blob';

export async function uploadWineImage(wineId: string, buffer: Buffer): Promise<string> {
  const key = `vinsfins/images/v2/${wineId}.jpg`;
  const res = await put(key, buffer, {
    access: 'public',
    addRandomSuffix: false,
    cacheControlMaxAge: 31_536_000,
    contentType: 'image/jpeg',
    allowOverwrite: true,
  });
  return res.url;
}

export async function deleteOldWineImage(wineId: string, ext: 'jpg' | 'png' | 'webp'): Promise<void> {
  const key = `vinsfins/images/${wineId}.${ext}`;
  try {
    await del(key);
  } catch (err) {
    const msg = (err as Error).message;
    if (!msg.includes('not_found') && !msg.includes('404')) throw err;
  }
}
```

- [ ] **Step 2: Commit**

```
git add scripts/v2/blob-upload.ts
git commit -m "feat(v2): blob upload + delete wrapper for v2 images"
```

---

## Task 9: Audit stage

**Files:**
- Create: `scripts/v2/audit.ts`
- Create: `tests/v2/audit.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/v2/audit.test.ts
import { describe, it, expect, vi } from 'vitest';
import { auditOne } from '../../scripts/v2/audit';
import type { Wine } from '../../scripts/v2/types';

const wine: Wine = {
  id: 'test-1',
  name: 'Domaine Gramenon La Sagesse 2022',
  region: 'Rhône', country: 'France', grape: 'Grenache',
  category: 'red',
  image: 'https://example.com/broken.jpg',
};

describe('auditOne', () => {
  it('returns passed=false when fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 404 })));
    const r = await auditOne(wine);
    expect(r.passed).toBe(false);
    expect(r.result.reasons[0]).toMatch(/fetch|http/);
    vi.unstubAllGlobals();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- audit`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement audit.ts**

```ts
// scripts/v2/audit.ts
import sharp from 'sharp';
import type { Wine, AuditRecord, Candidate } from './types';
import { scoreCandidate } from './validate';
import { cornerVariance } from './corner-variance';
import { fetchImage } from './normalize';
import { readState, writeState } from './state';

const AUDIT_STATE = 'scripts/v2/state/audit.json';

export async function auditOne(wine: Wine): Promise<AuditRecord> {
  try {
    const buf = await fetchImage(wine.image, 10_000);
    const meta = await sharp(buf).metadata();
    const cand: Candidate = {
      imageUrl: wine.image,
      sourcePageUrl: '', sourcePageTitle: '',
      source: 'bing',
      width: meta.width, height: meta.height,
    };
    const cv = await cornerVariance(buf).catch(() => undefined);
    const result = scoreCandidate(wine, cand, cv);
    return { wineId: wine.id, currentImageUrl: wine.image, result, passed: result.confidence === 'HIGH' };
  } catch (err) {
    return {
      wineId: wine.id,
      currentImageUrl: wine.image,
      result: { confidence: 'NONE', reasons: [`fetch-failed:${(err as Error).message}`], metrics: {} as any },
      passed: false,
    };
  }
}

export async function runAudit(wines: Wine[], concurrency = 8): Promise<AuditRecord[]> {
  const existing = readState<AuditRecord>(AUDIT_STATE);
  const doneIds = new Set(existing.map((r) => r.wineId));
  const todo = wines.filter((w) => !doneIds.has(w.id));

  const results = [...existing];
  for (let i = 0; i < todo.length; i += concurrency) {
    const batch = todo.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(auditOne));
    results.push(...batchResults);
    writeState(AUDIT_STATE, results);
    console.log(`audit: ${results.length}/${wines.length}`);
  }
  return results;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- audit`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```
git add scripts/v2/audit.ts tests/v2/audit.test.ts
git commit -m "feat(v2): audit stage with resumable state"
```

---

## Task 10: Source registry

**Files:**
- Create: `scripts/v2/sources/index.ts`

- [ ] **Step 1: Implement registry**

```ts
// scripts/v2/sources/index.ts
import type { Wine, Candidate } from '../types';
import { searchVivino } from './vivino';
import { searchWineSearcher } from './wine-searcher';
import { searchProducer } from './producer';
import { searchBing } from './bing';

export interface Source {
  name: Candidate['source'];
  search: (wine: Wine) => Promise<Candidate[]>;
}

export const SOURCES: Source[] = [
  { name: 'vivino', search: searchVivino },
  { name: 'wine-searcher', search: searchWineSearcher },
  { name: 'producer', search: searchProducer },
  { name: 'bing', search: searchBing },
];
```

- [ ] **Step 2: Commit (will fail to compile until sources exist — that's fine, next tasks add them)**

```
git add scripts/v2/sources/index.ts
git commit -m "feat(v2): source registry (stub)"
```

---

## Task 11: Vivino source adapter

**Files:**
- Create: `scripts/v2/sources/vivino.ts`
- Create: `tests/v2/sources/vivino.test.ts`
- Create: `tests/v2/fixtures/vivino-antidoot.html`

- [ ] **Step 1: Capture a fixture**

Run:
```
mkdir -p tests/v2/fixtures
curl -sSL -A "Mozilla/5.0" "https://www.vivino.com/search/wines?q=antidoot+woopwoop" > tests/v2/fixtures/vivino-antidoot.html
head -c 200 tests/v2/fixtures/vivino-antidoot.html
```

If the response is a block page or empty, write a hand-crafted minimal fixture with representative markup. Vivino's search response contains elements like `<a class="wine-card__name-wrapper">` and `<img src="...vivino.com/thumbs/...">`.

- [ ] **Step 2: Write the failing test**

```ts
// tests/v2/sources/vivino.test.ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseVivinoResults } from '../../../scripts/v2/sources/vivino';

describe('parseVivinoResults', () => {
  it('extracts image URL and title from search HTML', () => {
    const html = readFileSync(join(__dirname, '../fixtures/vivino-antidoot.html'), 'utf-8');
    const cands = parseVivinoResults(html);
    expect(cands.length).toBeGreaterThan(0);
    expect(cands[0].imageUrl).toMatch(/vivino\.com/);
    expect(cands[0].source).toBe('vivino');
    expect(cands[0].sourcePageTitle).toBeTruthy();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- vivino`
Expected: FAIL.

- [ ] **Step 4: Implement vivino.ts**

```ts
// scripts/v2/sources/vivino.ts
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
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- vivino`
Expected: PASS.
If the captured fixture is empty/blocked, fall back to a hand-crafted minimal HTML in the fixture file to make the test pass — the parser logic is what matters.

- [ ] **Step 6: Commit**

```
git add scripts/v2/sources/vivino.ts tests/v2/sources/vivino.test.ts tests/v2/fixtures/vivino-antidoot.html
git commit -m "feat(v2): Vivino search adapter"
```

---

## Task 12: Wine-Searcher source adapter

**Files:**
- Create: `scripts/v2/sources/wine-searcher.ts`
- Create: `tests/v2/sources/wine-searcher.test.ts`
- Create: `tests/v2/fixtures/wine-searcher-gramenon.html`

- [ ] **Step 1: Capture a fixture**

```
curl -sSL -A "Mozilla/5.0" "https://www.wine-searcher.com/find/gramenon+la+sagesse" > tests/v2/fixtures/wine-searcher-gramenon.html
```

If blocked, hand-craft a minimal fixture containing `<div class="wine-item">` with `<img src="https://img.wine-searcher.com/...">` and a title element.

- [ ] **Step 2: Write the failing test**

```ts
// tests/v2/sources/wine-searcher.test.ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseWineSearcherResults } from '../../../scripts/v2/sources/wine-searcher';

describe('parseWineSearcherResults', () => {
  it('extracts candidates from search HTML', () => {
    const html = readFileSync(join(__dirname, '../fixtures/wine-searcher-gramenon.html'), 'utf-8');
    const cands = parseWineSearcherResults(html);
    expect(cands.length).toBeGreaterThan(0);
    expect(cands[0].source).toBe('wine-searcher');
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `npm test -- wine-searcher`
Expected: FAIL.

- [ ] **Step 4: Implement wine-searcher.ts**

```ts
// scripts/v2/sources/wine-searcher.ts
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
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- wine-searcher`
Expected: PASS.

- [ ] **Step 6: Commit**

```
git add scripts/v2/sources/wine-searcher.ts tests/v2/sources/wine-searcher.test.ts tests/v2/fixtures/wine-searcher-gramenon.html
git commit -m "feat(v2): Wine-Searcher adapter"
```

---

## Task 13: Producer domain source adapter

**Files:**
- Create: `scripts/v2/sources/producer.ts`
- Create: `tests/v2/sources/producer.test.ts`
- Create: `tests/v2/fixtures/producer-antidoot.html`

- [ ] **Step 1: Create a minimal fixture**

Write `tests/v2/fixtures/producer-antidoot.html`:
```html
<!doctype html>
<html>
<head>
  <meta property="og:image" content="https://antidoot.be/media/woopwoop-sous-voile.jpg">
  <title>Antidoot — WoopWoop Sous Voile</title>
</head>
<body></body>
</html>
```

- [ ] **Step 2: Write the failing test**

```ts
// tests/v2/sources/producer.test.ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseProducerPage } from '../../../scripts/v2/sources/producer';

describe('parseProducerPage', () => {
  it('extracts og:image and title', () => {
    const html = readFileSync(join(__dirname, '../fixtures/producer-antidoot.html'), 'utf-8');
    const cands = parseProducerPage(html, 'https://antidoot.be');
    expect(cands[0].imageUrl).toBe('https://antidoot.be/media/woopwoop-sous-voile.jpg');
    expect(cands[0].sourcePageTitle).toContain('Antidoot');
    expect(cands[0].source).toBe('producer');
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `npm test -- producer`
Expected: FAIL.

- [ ] **Step 4: Implement producer.ts**

```ts
// scripts/v2/sources/producer.ts
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
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- producer`
Expected: PASS.

- [ ] **Step 6: Commit**

```
git add scripts/v2/sources/producer.ts tests/v2/sources/producer.test.ts tests/v2/fixtures/producer-antidoot.html
git commit -m "feat(v2): producer domain og:image adapter"
```

---

## Task 14: Bing fallback source adapter

**Files:**
- Create: `scripts/v2/sources/bing.ts`
- Create: `tests/v2/sources/bing.test.ts`
- Create: `tests/v2/fixtures/bing-gramenon.html`

- [ ] **Step 1: Create a minimal fixture**

Write `tests/v2/fixtures/bing-gramenon.html` with representative markup:
```html
<html><body>
<div class="iuscp"><a class="iusc" m='{"murl":"https://example.com/gramenon.jpg","turl":"https://x","t":"Domaine Gramenon La Sagesse"}'><img src="x"></a></div>
</body></html>
```

- [ ] **Step 2: Write the failing test**

```ts
// tests/v2/sources/bing.test.ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseBingResults } from '../../../scripts/v2/sources/bing';

describe('parseBingResults', () => {
  it('extracts murl + title from Bing markup', () => {
    const html = readFileSync(join(__dirname, '../fixtures/bing-gramenon.html'), 'utf-8');
    const cands = parseBingResults(html);
    expect(cands.length).toBeGreaterThan(0);
    expect(cands[0].imageUrl).toBe('https://example.com/gramenon.jpg');
    expect(cands[0].source).toBe('bing');
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `npm test -- bing`
Expected: FAIL.

- [ ] **Step 4: Implement bing.ts**

```ts
// scripts/v2/sources/bing.ts
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
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- bing`
Expected: PASS.

- [ ] **Step 6: Commit**

```
git add scripts/v2/sources/bing.ts tests/v2/sources/bing.test.ts tests/v2/fixtures/bing-gramenon.html
git commit -m "feat(v2): Bing fallback source adapter"
```

---

## Task 15: Waterfall orchestrator

**Files:**
- Create: `scripts/v2/waterfall.ts`
- Create: `tests/v2/waterfall.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/v2/waterfall.test.ts
import { describe, it, expect } from 'vitest';
import { runWaterfallForWine } from '../../scripts/v2/waterfall';
import type { Wine } from '../../scripts/v2/types';

const wine: Wine = {
  id: 'antidoot-1', name: 'WoopWoop sous voile ANTIDOOT', region: '', country: 'Belgium', grape: 'x',
  category: 'beer', image: '',
};

describe('runWaterfallForWine', () => {
  it('collects candidates from all sources', async () => {
    const fakeSources = [
      { name: 'vivino' as const, search: async () => [{ imageUrl: 'https://vivino.com/a.jpg', sourcePageUrl: '', sourcePageTitle: 'Antidoot WoopWoop', source: 'vivino' as const }] },
      { name: 'bing' as const, search: async () => [{ imageUrl: 'https://x.com/b.jpg', sourcePageUrl: '', sourcePageTitle: 'other', source: 'bing' as const }] },
    ];
    const cands = await runWaterfallForWine(wine, fakeSources);
    expect(cands.length).toBe(2);
  });

  it('skips a source that throws', async () => {
    const fakeSources = [
      { name: 'vivino' as const, search: async () => { throw new Error('429'); } },
      { name: 'bing' as const, search: async () => [{ imageUrl: 'https://x.com/b.jpg', sourcePageUrl: '', sourcePageTitle: 't', source: 'bing' as const }] },
    ];
    const cands = await runWaterfallForWine(wine, fakeSources);
    expect(cands.length).toBe(1);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- waterfall`
Expected: FAIL.

- [ ] **Step 3: Implement waterfall.ts**

```ts
// scripts/v2/waterfall.ts
import type { Wine, Candidate } from './types';
import type { Source } from './sources';
import { SOURCES } from './sources';
import { readState, writeState } from './state';

const CANDIDATES_STATE = 'scripts/v2/state/candidates.json';

export async function runWaterfallForWine(wine: Wine, sources: Source[] = SOURCES): Promise<Candidate[]> {
  const all: Candidate[] = [];
  for (const src of sources) {
    try {
      const found = await src.search(wine);
      all.push(...found);
    } catch (err) {
      console.warn(`[waterfall] ${wine.id} source=${src.name} error=${(err as Error).message}`);
    }
    await sleep(1200);
  }
  return all;
}

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

export async function runWaterfall(wines: Wine[]): Promise<Record<string, Candidate[]>> {
  const existing = readState<{ wineId: string; candidates: Candidate[] }>(CANDIDATES_STATE);
  const doneIds = new Set(existing.map((r) => r.wineId));
  const out: Record<string, Candidate[]> = Object.fromEntries(existing.map((r) => [r.wineId, r.candidates]));
  const todo = wines.filter((w) => !doneIds.has(w.id));

  for (let i = 0; i < todo.length; i++) {
    const w = todo[i];
    const cands = await runWaterfallForWine(w);
    out[w.id] = cands;
    const asList = Object.entries(out).map(([wineId, candidates]) => ({ wineId, candidates }));
    writeState(CANDIDATES_STATE, asList);
    console.log(`waterfall: ${i + 1}/${todo.length} — ${w.id} (${cands.length} candidates)`);
  }
  return out;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- waterfall`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```
git add scripts/v2/waterfall.ts tests/v2/waterfall.test.ts
git commit -m "feat(v2): waterfall orchestrator with per-source error isolation"
```

---

## Task 16: Classify stage

**Files:**
- Create: `scripts/v2/classify.ts`
- Create: `tests/v2/classify.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/v2/classify.test.ts
import { describe, it, expect } from 'vitest';
import { classifyWine } from '../../scripts/v2/classify';
import type { Wine, Candidate } from '../../scripts/v2/types';

const wine: Wine = { id: 'x', name: 'Domaine Gramenon La Sagesse 2022', region: 'Rhône', country: 'FR', grape: 'Grenache', category: 'red', image: '' };

describe('classifyWine', () => {
  it('auto-accepts when at least one candidate is HIGH', async () => {
    const cands: Candidate[] = [{
      imageUrl: 'https://images.vivino.com/thumbs/gramenon-sagesse_x600.png',
      sourcePageUrl: 'https://vivino.com/gramenon-sagesse',
      sourcePageTitle: 'Domaine Gramenon La Sagesse',
      source: 'vivino', width: 600, height: 900,
    }];
    const r = await classifyWine(wine, cands, { fetchBuffers: false });
    expect(r.decision).toBe('auto-accept');
    expect(r.chosen?.validation.confidence).toBe('HIGH');
  });

  it('flags when no candidate is HIGH', async () => {
    const cands: Candidate[] = [{
      imageUrl: 'https://cdn.shopify.com/voodoo-ranger.jpg',
      sourcePageUrl: '', sourcePageTitle: 'Voodoo Ranger',
      source: 'bing', width: 4000, height: 4000,
    }];
    const r = await classifyWine(wine, cands, { fetchBuffers: false });
    expect(r.decision).toBe('flag');
  });

  it('flags with empty candidates list', async () => {
    const r = await classifyWine(wine, [], { fetchBuffers: false });
    expect(r.decision).toBe('flag');
    expect(r.candidates.length).toBe(0);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- classify`
Expected: FAIL.

- [ ] **Step 3: Implement classify.ts**

```ts
// scripts/v2/classify.ts
import sharp from 'sharp';
import type { Wine, Candidate, ClassifiedRecord, ValidationResult } from './types';
import { scoreCandidate } from './validate';
import { cornerVariance } from './corner-variance';
import { fetchImage } from './normalize';
import { readState, writeState } from './state';

const CLASSIFIED_STATE = 'scripts/v2/state/classified.json';

export interface ClassifyOpts { fetchBuffers?: boolean }

async function fillDimensions(cand: Candidate): Promise<{ cand: Candidate; buf?: Buffer }> {
  if (cand.width && cand.height) return { cand };
  try {
    const buf = await fetchImage(cand.imageUrl, 8000);
    const meta = await sharp(buf).metadata();
    return { cand: { ...cand, width: meta.width, height: meta.height }, buf };
  } catch {
    return { cand };
  }
}

export async function classifyWine(
  wine: Wine,
  candidates: Candidate[],
  opts: ClassifyOpts = { fetchBuffers: true }
): Promise<ClassifiedRecord> {
  const scored: Array<Candidate & { validation: ValidationResult }> = [];
  for (const c of candidates) {
    let cand = c;
    let buf: Buffer | undefined;
    if (opts.fetchBuffers) {
      const filled = await fillDimensions(c);
      cand = filled.cand;
      buf = filled.buf;
    }
    const cv = buf ? await cornerVariance(buf).catch(() => undefined) : undefined;
    const validation = scoreCandidate(wine, cand, cv);
    scored.push({ ...cand, validation });
  }
  scored.sort((a, b) => rank(b.validation.confidence) - rank(a.validation.confidence));
  const high = scored.find((c) => c.validation.confidence === 'HIGH');
  if (high) return { wineId: wine.id, decision: 'auto-accept', chosen: high, candidates: scored };
  return { wineId: wine.id, decision: 'flag', candidates: scored };
}

function rank(c: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE'): number {
  return { HIGH: 3, MEDIUM: 2, LOW: 1, NONE: 0 }[c];
}

export async function runClassify(
  wines: Wine[],
  candidatesMap: Record<string, Candidate[]>
): Promise<ClassifiedRecord[]> {
  const existing = readState<ClassifiedRecord>(CLASSIFIED_STATE);
  const doneIds = new Set(existing.map((r) => r.wineId));
  const results = [...existing];
  const todo = wines.filter((w) => !doneIds.has(w.id));
  for (let i = 0; i < todo.length; i++) {
    const w = todo[i];
    const cands = candidatesMap[w.id] || [];
    results.push(await classifyWine(w, cands));
    writeState(CLASSIFIED_STATE, results);
    console.log(`classify: ${i + 1}/${todo.length} — ${w.id}`);
  }
  return results;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- classify`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```
git add scripts/v2/classify.ts tests/v2/classify.test.ts
git commit -m "feat(v2): classify stage (auto-accept HIGH, else flag)"
```

---

## Task 17: Review UI — API routes

**Files:**
- Create: `app/admin/image-review/api/decide/route.ts`
- Create: `app/admin/image-review/api/queue/route.ts`

- [ ] **Step 1: Implement the decide route handler**

```ts
// app/admin/image-review/api/decide/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DECISIONS_PATH = join(process.cwd(), 'scripts/v2/state/decisions.json');

function devOnly(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') return false;
  if (req.headers.get('x-forwarded-for')) return false;
  return true;
}

export async function GET(req: NextRequest) {
  if (!devOnly(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  if (!existsSync(DECISIONS_PATH)) return NextResponse.json([]);
  return NextResponse.json(JSON.parse(readFileSync(DECISIONS_PATH, 'utf-8')));
}

export async function POST(req: NextRequest) {
  if (!devOnly(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const body = await req.json();
  if (!body.wineId || !body.action) return NextResponse.json({ error: 'bad-request' }, { status: 400 });

  mkdirSync(join(process.cwd(), 'scripts/v2/state'), { recursive: true });
  const existing: any[] = existsSync(DECISIONS_PATH) ? JSON.parse(readFileSync(DECISIONS_PATH, 'utf-8')) : [];
  const filtered = existing.filter((d) => d.wineId !== body.wineId);
  filtered.push({ ...body, timestamp: Date.now() });
  writeFileSync(DECISIONS_PATH, JSON.stringify(filtered, null, 2));
  return NextResponse.json({ ok: true, count: filtered.length });
}
```

- [ ] **Step 2: Implement the queue route handler**

```ts
// app/admin/image-review/api/queue/route.ts
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
```

- [ ] **Step 3: Commit**

```
git add app/admin/image-review/api/decide/route.ts app/admin/image-review/api/queue/route.ts
git commit -m "feat(v2): review UI API routes (dev-only)"
```

---

## Task 18: Review UI — page

**Files:**
- Create: `app/admin/image-review/page.tsx`

- [ ] **Step 1: Implement the page**

```tsx
// app/admin/image-review/page.tsx
'use client';

import { useEffect, useState } from 'react';

type Classified = {
  wineId: string;
  decision: 'keep' | 'auto-accept' | 'flag';
  chosen?: { imageUrl: string; validation: { confidence: string; reasons: string[] } };
  candidates: Array<{ imageUrl: string; sourcePageUrl: string; sourcePageTitle: string; source: string; validation: { confidence: string; reasons: string[] } }>;
};

type WineMeta = { id: string; name: string; region: string; country: string; grape: string; category: string; currentImage: string };

export default function ReviewPage() {
  const [queue, setQueue] = useState<Array<Classified & { wine: WineMeta }>>([]);
  const [decisions, setDecisions] = useState<Record<string, { action: string; imageUrl?: string; pastedUrl?: string }>>({});
  const [i, setI] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch('/admin/image-review/api/queue').then((r) => r.json()),
      fetch('/admin/image-review/api/decide').then((r) => r.json()),
    ]).then(([q, d]) => {
      setQueue(q);
      const seen: Record<string, any> = {};
      for (const dd of d) seen[dd.wineId] = dd;
      setDecisions(seen);
      const next = q.findIndex((item: any) => !seen[item.wineId]);
      setI(Math.max(0, next));
    });
  }, []);

  if (queue.length === 0) return <main className="p-8">Loading or no flagged wines.</main>;
  const item = queue[i];
  if (!item) return <main className="p-8">All done! {queue.length} wines reviewed.</main>;

  async function submit(action: string, payload: Record<string, unknown>) {
    const res = await fetch('/admin/image-review/api/decide', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ wineId: item.wineId, action, ...payload }),
    });
    if (res.ok) setI((n) => n + 1);
  }

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-semibold mb-2">{item.wine.name}</h1>
      <p className="text-sm text-gray-600 mb-4">
        {item.wine.country} · {item.wine.region} · {item.wine.grape} · ({i + 1}/{queue.length})
      </p>
      {item.wine.currentImage && (
        <div className="mb-4">
          <div className="text-xs text-gray-500">Current</div>
          <img src={item.wine.currentImage} alt="current" className="h-48 border" />
        </div>
      )}
      <div className="grid grid-cols-4 gap-3">
        {item.candidates.map((c, idx) => (
          <button key={idx} onClick={() => submit('accept', { imageUrl: c.imageUrl })}
                  className="border rounded p-2 hover:border-black text-left">
            <img src={c.imageUrl} alt="" className="h-48 w-full object-contain mb-2" />
            <div className="text-xs">
              <div><b>{c.source}</b> — {c.validation.confidence}</div>
              <div className="text-gray-500 truncate">{c.sourcePageTitle}</div>
              <div className="text-gray-500">{c.validation.reasons.join(', ')}</div>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-6 flex gap-2 items-end">
        <form onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); const url = f.get('url') as string; if (url) submit('pasted-url', { pastedUrl: url }); }}>
          <input name="url" placeholder="Paste a better image URL" className="border px-2 py-1 w-96" />
          <button className="ml-2 border px-3 py-1">Use URL</button>
        </form>
        <button onClick={() => submit('placeholder', { placeholderCategory: item.wine.category })} className="border px-3 py-1">
          Use category placeholder
        </button>
        <button onClick={() => setI((n) => n + 1)} className="border px-3 py-1">Skip</button>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Smoke test locally**

Run:
```
npm run dev
```

Open http://localhost:3000/admin/image-review.
Expected: page loads. If `classified.json` is empty, shows "Loading or no flagged wines." (this is fine at this stage — nothing to review yet.)

- [ ] **Step 3: Commit**

```
git add app/admin/image-review/page.tsx
git commit -m "feat(v2): review UI page"
```

---

## Task 19: Apply stage

**Files:**
- Create: `scripts/v2/apply.ts`
- Create: `tests/v2/apply.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/v2/apply.test.ts
import { describe, it, expect } from 'vitest';
import { updateWineImageInSource } from '../../scripts/v2/apply';

describe('updateWineImageInSource', () => {
  it('replaces the image URL for a given wine id', () => {
    const src = `
  {
    id: 'gramenon-sagesse-2022',
    name: 'La Sagesse',
    image: 'https://old.example.com/x.jpg',
    isAvailable: true,
  },`;
    const out = updateWineImageInSource(src, 'gramenon-sagesse-2022', 'https://new.example.com/y.jpg');
    expect(out).toContain("image: 'https://new.example.com/y.jpg'");
    expect(out).not.toContain('https://old.example.com/x.jpg');
  });

  it('is a no-op when wine id not present', () => {
    const src = `{ id: 'other', image: 'https://x.jpg' },`;
    const out = updateWineImageInSource(src, 'missing', 'https://new.jpg');
    expect(out).toBe(src);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- apply`
Expected: FAIL.

- [ ] **Step 3: Implement apply.ts**

```ts
// scripts/v2/apply.ts
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { readState } from './state';
import { normalizeToPortrait, fetchImage } from './normalize';
import { uploadWineImage } from './blob-upload';
import type { Decision, ClassifiedRecord } from './types';

const WINES_FILE = join(process.cwd(), 'data/wines.ts');
const CLASSIFIED = 'scripts/v2/state/classified.json';
const DECISIONS = 'scripts/v2/state/decisions.json';

export function updateWineImageInSource(src: string, wineId: string, newUrl: string): string {
  const blockRe = new RegExp(
    `(\\{[^{}]*id:\\s*['"]${wineId.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}['"][^{}]*?image:\\s*)['"][^'"]*['"]`,
    's'
  );
  return src.replace(blockRe, `$1'${newUrl}'`);
}

function placeholderUrlFor(category: string): string {
  return `https://cmbsxh7oipaip57r.public.blob.vercel-storage.com/vinsfins/images/placeholders/${category}.jpg`;
}

export async function resolveDecisionToUrl(d: Decision, classifiedById: Map<string, ClassifiedRecord>): Promise<string | null> {
  if (d.action === 'skip') return null;
  let sourceUrl: string | null = null;
  if (d.action === 'accept' && d.imageUrl) sourceUrl = d.imageUrl;
  else if (d.action === 'pasted-url' && d.pastedUrl) sourceUrl = d.pastedUrl;
  else if (d.action === 'placeholder' && d.placeholderCategory) return placeholderUrlFor(d.placeholderCategory);
  if (!sourceUrl) return null;

  const buf = await fetchImage(sourceUrl);
  const normalized = await normalizeToPortrait(buf);
  return uploadWineImage(d.wineId, normalized);
}

export async function runApply(): Promise<void> {
  const classified = readState<ClassifiedRecord>(CLASSIFIED);
  const decisions = readState<Decision>(DECISIONS);
  const classifiedById = new Map(classified.map((c) => [c.wineId, c]));

  const autoAccepts: Decision[] = classified
    .filter((c) => c.decision === 'auto-accept' && c.chosen)
    .filter((c) => !decisions.find((d) => d.wineId === c.wineId))
    .map((c) => ({ wineId: c.wineId, action: 'accept', imageUrl: c.chosen!.imageUrl, timestamp: Date.now() }));

  const allDecisions = [...decisions, ...autoAccepts];

  let src = readFileSync(WINES_FILE, 'utf-8');
  let applied = 0;

  for (let i = 0; i < allDecisions.length; i++) {
    const d = allDecisions[i];
    try {
      const newUrl = await resolveDecisionToUrl(d, classifiedById);
      if (!newUrl) continue;
      const next = updateWineImageInSource(src, d.wineId, newUrl);
      if (next === src) { console.warn(`[apply] no-op for ${d.wineId} (id not found)`); continue; }
      src = next;
      applied++;
      if (applied % 10 === 0) writeFileSync(WINES_FILE, src);
      console.log(`apply: ${i + 1}/${allDecisions.length} — ${d.wineId}`);
    } catch (err) {
      console.error(`[apply] failed for ${d.wineId}: ${(err as Error).message}`);
    }
  }

  writeFileSync(WINES_FILE, src);
  console.log(`apply: wrote ${applied} image updates to data/wines.ts`);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- apply`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```
git add scripts/v2/apply.ts tests/v2/apply.test.ts
git commit -m "feat(v2): apply stage — resolve decisions, upload, rewrite wines.ts"
```

---

## Task 20: Orchestrator CLI

**Files:**
- Create: `scripts/v2/orchestrate.ts`

- [ ] **Step 1: Implement orchestrator**

```ts
// scripts/v2/orchestrate.ts
import { wines as allWines } from '../../data/wines';
import type { Wine, AuditRecord, ClassifiedRecord } from './types';
import { readState } from './state';
import { runAudit } from './audit';
import { runWaterfall } from './waterfall';
import { runClassify } from './classify';
import { runApply } from './apply';

const stage = (process.argv.find((a) => a.startsWith('--stage='))?.split('=')[1] ?? 'all') as
  | 'audit' | 'scrape' | 'classify' | 'review' | 'apply' | 'all';

const limitArg = process.argv.find((a) => a.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;
const wines = (allWines as unknown as Wine[]).slice(0, limit);

async function main() {
  if (stage === 'audit' || stage === 'all') {
    console.log('=== AUDIT ===');
    const results = await runAudit(wines);
    const passed = results.filter((r) => r.passed).length;
    console.log(`audit done: ${passed}/${results.length} passed`);
  }

  if (stage === 'scrape' || stage === 'all') {
    console.log('=== WATERFALL ===');
    const audit = readState<AuditRecord>('scripts/v2/state/audit.json');
    const failedIds = new Set(audit.filter((r) => !r.passed).map((r) => r.wineId));
    const failedWines = wines.filter((w) => failedIds.has(w.id));
    console.log(`waterfall: ${failedWines.length} wines`);
    await runWaterfall(failedWines);
  }

  if (stage === 'classify' || stage === 'all') {
    console.log('=== CLASSIFY ===');
    const audit = readState<AuditRecord>('scripts/v2/state/audit.json');
    const failedIds = new Set(audit.filter((r) => !r.passed).map((r) => r.wineId));
    const failedWines = wines.filter((w) => failedIds.has(w.id));
    const cands = readState<{ wineId: string; candidates: any[] }>('scripts/v2/state/candidates.json');
    const candMap = Object.fromEntries(cands.map((c) => [c.wineId, c.candidates]));
    const classified = await runClassify(failedWines, candMap);
    const autoCount = classified.filter((c) => c.decision === 'auto-accept').length;
    const flagCount = classified.filter((c) => c.decision === 'flag').length;
    console.log(`classify done: ${autoCount} auto-accept, ${flagCount} flagged`);
  }

  if (stage === 'review') {
    console.log('Run `npm run dev` and open http://localhost:3000/admin/image-review');
  }

  if (stage === 'apply' || stage === 'all') {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN required. Run: vercel env pull .env.local');
      process.exit(1);
    }
    console.log('=== APPLY ===');
    await runApply();
  }

  console.log('\n=== SUMMARY ===');
  const audit = readState<AuditRecord>('scripts/v2/state/audit.json');
  const classified = readState<ClassifiedRecord>('scripts/v2/state/classified.json');
  console.log(`audited: ${audit.length}, passed: ${audit.filter((r) => r.passed).length}`);
  console.log(`classified: ${classified.length}, auto-accept: ${classified.filter((c) => c.decision === 'auto-accept').length}, flagged: ${classified.filter((c) => c.decision === 'flag').length}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
```

- [ ] **Step 2: Add CLI scripts to package.json**

Add to `"scripts"`:
```json
"rescrape:audit": "tsx scripts/v2/orchestrate.ts --stage=audit",
"rescrape:scrape": "tsx scripts/v2/orchestrate.ts --stage=scrape",
"rescrape:classify": "tsx scripts/v2/orchestrate.ts --stage=classify",
"rescrape:apply": "tsx scripts/v2/orchestrate.ts --stage=apply",
"rescrape:all": "tsx scripts/v2/orchestrate.ts --stage=all"
```

- [ ] **Step 3: Commit**

```
git add scripts/v2/orchestrate.ts package.json
git commit -m "feat(v2): orchestrator CLI + npm scripts"
```

---

## Task 21: Integration smoke test (gated)

**Files:**
- Create: `tests/v2/integration/waterfall.int.test.ts`

- [ ] **Step 1: Write the integration test**

```ts
// tests/v2/integration/waterfall.int.test.ts
import { describe, it, expect } from 'vitest';
import { runWaterfallForWine } from '../../../scripts/v2/waterfall';
import { classifyWine } from '../../../scripts/v2/classify';
import type { Wine } from '../../../scripts/v2/types';

const skip = !process.env.RUN_INTEGRATION;
const d = skip ? describe.skip : describe;

const cases: Array<{ wine: Wine; expect: 'auto-accept' | 'flag' }> = [
  {
    wine: { id: 'gramenon-sagesse', name: 'Domaine Gramenon La Sagesse 2022', region: 'Rhône', country: 'France', grape: 'Grenache', category: 'red', image: '' },
    expect: 'auto-accept',
  },
  {
    wine: { id: 'pinot-generic', name: 'Pinot Noir 2019', region: '', country: '', grape: 'Pinot', category: 'red', image: '' },
    expect: 'flag',
  },
];

d('integration: waterfall + classify', () => {
  for (const c of cases) {
    it(`${c.wine.id} → ${c.expect}`, async () => {
      const cands = await runWaterfallForWine(c.wine);
      const result = await classifyWine(c.wine, cands);
      expect(result.decision).toBe(c.expect);
    }, 60_000);
  }
});
```

- [ ] **Step 2: Verify skipped by default**

Run: `npm test`
Expected: all tests pass; integration tests are listed as skipped.

- [ ] **Step 3: Verify gated run works (optional manual check)**

Run: `RUN_INTEGRATION=1 npm run test:int`
Expected: integration tests run against live Vivino/Bing. May be flaky; goal is end-to-end smoke, not CI reliability. Log outcomes for debugging.

- [ ] **Step 4: Commit**

```
git add tests/v2/integration/waterfall.int.test.ts
git commit -m "test(v2): integration smoke test gated on RUN_INTEGRATION"
```

---

## Task 22: End-to-end dry run on first 20 wines

Operational checkpoint — no new code. Verifies the whole pipeline works before committing to all 730.

- [ ] **Step 1: Pull blob credentials**

```
vercel env pull .env.local
```

Expected: creates `.env.local` with `BLOB_READ_WRITE_TOKEN`.

- [ ] **Step 2: Run audit on 20 wines**

```
npx tsx -r dotenv/config scripts/v2/orchestrate.ts --stage=audit --limit=20
```

Expected: produces `scripts/v2/state/audit.json` with 20 records.

- [ ] **Step 3: Run waterfall on the failed subset**

```
npx tsx -r dotenv/config scripts/v2/orchestrate.ts --stage=scrape --limit=20
```

Expected: produces `scripts/v2/state/candidates.json`. Inspect the file by eye — each failed wine should have at least some candidates.

- [ ] **Step 4: Run classify**

```
npx tsx -r dotenv/config scripts/v2/orchestrate.ts --stage=classify --limit=20
```

Expected: produces `scripts/v2/state/classified.json`. Ratio of auto-accept vs flag tells you if the thresholds are sane. If 0% auto-accept, HIGH threshold is too strict — revisit `scripts/v2/validate.ts`. If >90% auto-accept, threshold is too loose — tighten.

- [ ] **Step 5: Review the flagged ones**

```
npm run dev
```

Open http://localhost:3000/admin/image-review. Click through flagged wines. Accept or reject candidates. Verify `scripts/v2/state/decisions.json` gets written.

- [ ] **Step 6: Apply and verify**

```
npx tsx -r dotenv/config scripts/v2/orchestrate.ts --stage=apply --limit=20
```

Open `data/wines.ts` and confirm the first 20 wines' `image:` fields now point to `v2/` Blob URLs. Start a new dev server and hit the shop pages for those wines — images should render.

At this checkpoint: if the pipeline works end-to-end on 20, you're cleared to run the full 730. If not, iterate on validate/source adapters before proceeding.

---

## Task 23: Full run on all 730

Operational only — no new code.

- [ ] **Step 1: Reset state (since the 20-run leaves partial state)**

```
rm scripts/v2/state/*.json
```

- [ ] **Step 2: Run all stages**

```
npx tsx -r dotenv/config scripts/v2/orchestrate.ts --stage=audit
npx tsx -r dotenv/config scripts/v2/orchestrate.ts --stage=scrape
npx tsx -r dotenv/config scripts/v2/orchestrate.ts --stage=classify
```

Expect scrape to take roughly (failed-count × 5s) due to per-source polite rate-limiting. For 300 failed wines: ~25 min.

- [ ] **Step 3: Review flagged wines through the UI**

```
npm run dev
```

Open http://localhost:3000/admin/image-review and work through the queue. Estimate 10–15 seconds per wine × ~150 flagged = 30 min.

- [ ] **Step 4: Apply**

```
npx tsx -r dotenv/config scripts/v2/orchestrate.ts --stage=apply
```

- [ ] **Step 5: Visual QA**

```
npm run dev
```

Walk `/boutique`, `/vins`, and sample wine pages to confirm images render correctly.

- [ ] **Step 6: Commit wines.ts as a content change**

```
git add data/wines.ts
git commit -m "content: re-source wine bottle images via v2 pipeline"
```

---

## Self-review notes

- **Spec coverage:** Every spec section maps to a task — audit (T9), waterfall (T15), classify (T16), review UI (T17/T18), apply (T19), normalization (T7), Blob (T8), validation rules (T6), error handling (distributed across T15 source-catch, T19 apply-catch), testing (unit in each component, integration in T21, smoke in T22).
- **Placeholders:** None found. Every step contains actual code or an exact command.
- **Type consistency:** `Candidate`, `AuditRecord`, `ClassifiedRecord`, `Decision` are defined once in T2 (`types.ts`) and referenced consistently. Validation returns `ValidationResult` with `confidence: Confidence` — used by classify, audit, apply.
- **Scope:** One plan, one feature — image rescrape. No unrelated refactors.
- **Ambiguity:** The only deliberate heuristic is `extractProducerToken` — its behavior is nailed down by unit tests in T4.

One area of genuine risk: source adapters (Vivino, Wine-Searcher) scrape HTML that changes. Tests rely on saved fixtures, so they won't fail when sites change — but production runs will. Mitigation: per-source error catch is isolated in waterfall (T15, step 3), so a broken Vivino just means fallback to Wine-Searcher. Post-launch, if a source breaks, re-save the fixture and re-run the parser tests to derive the new selectors.
