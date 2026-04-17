import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { readState, writeState } from './state';
import { normalizeToPortrait, fetchImage } from './normalize';
import { uploadWineImage } from './blob-upload';
import type { Decision, ClassifiedRecord } from './types';

const WINES_FILE = join(process.cwd(), 'data/wines.ts');
const CLASSIFIED = 'scripts/v2/state/classified.json';
const DECISIONS = 'scripts/v2/state/decisions.json';
const APPLY_STATE = 'scripts/v2/state/applied.json';

export function updateWineImageInSource(src: string, wineId: string, newUrl: string): string {
  const lines = src.split('\n');
  const escapedId = wineId.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const idRe = new RegExp(`id:\\s*['"]${escapedId}['"]`);
  const imageRe = /^(\s*image:\s*)['"][^'"]*['"](.*)$/;
  for (let i = 0; i < lines.length; i++) {
    if (!idRe.test(lines[i])) continue;
    for (let j = i + 1; j < Math.min(i + 30, lines.length); j++) {
      const m = lines[j].match(imageRe);
      if (m) {
        lines[j] = `${m[1]}'${newUrl}'${m[2]}`;
        return lines.join('\n');
      }
    }
  }
  return src;
}

function placeholderUrlFor(category: string): string {
  return `https://cmbsxh7oipaip57r.public.blob.vercel-storage.com/vinsfins/images/placeholders/${category}.jpg`;
}

export async function resolveDecisionToUrl(d: Decision): Promise<string | null> {
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

interface AppliedRecord { wineId: string; newUrl: string; timestamp: number }

export type MinConfidence = 'HIGH' | 'MEDIUM' | 'LOW';

export async function runApply(concurrency = 4, minConfidence: MinConfidence = 'HIGH'): Promise<void> {
  const classified = readState<ClassifiedRecord>(CLASSIFIED);
  const decisions = readState<Decision>(DECISIONS);
  const applied = readState<AppliedRecord>(APPLY_STATE);
  const doneIds = new Set(applied.map((r) => r.wineId));

  const rank = (c: string) => ({ HIGH: 3, MEDIUM: 2, LOW: 1, NONE: 0 }[c as 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE'] ?? 0);
  const minRank = rank(minConfidence);

  const autoAccepts: Decision[] = classified
    .filter((c) => !decisions.find((d) => d.wineId === c.wineId))
    .map((c) => {
      // Use explicit chosen (HIGH auto-accept) if present, else the top-ranked candidate from flag
      const best = c.chosen ?? c.candidates[0];
      if (!best) return null;
      if (rank(best.validation.confidence) < minRank) return null;
      // Require producer-token match to prevent wrong-product decisions
      if (!best.validation.metrics.producerTokenHit) return null;
      return { wineId: c.wineId, action: 'accept' as const, imageUrl: best.imageUrl, timestamp: Date.now() };
    })
    .filter((d): d is Decision => d !== null);

  const allDecisions = [...decisions, ...autoAccepts].filter((d) => !doneIds.has(d.wineId));
  console.log(`apply: ${allDecisions.length} decisions to process (minConfidence=${minConfidence}; ${applied.length} already done)`);

  let completed = 0;
  const results: AppliedRecord[] = [...applied];

  const writeCheckpoint = () => writeState(APPLY_STATE, results);

  const worker = async (startIdx: number) => {
    for (let i = startIdx; i < allDecisions.length; i += concurrency) {
      const d = allDecisions[i];
      try {
        const newUrl = await resolveDecisionToUrl(d);
        if (!newUrl) {
          completed++;
          console.log(`apply: ${completed}/${allDecisions.length} — ${d.wineId} [skip]`);
          continue;
        }
        results.push({ wineId: d.wineId, newUrl, timestamp: Date.now() });
        completed++;
        if (completed % 10 === 0) writeCheckpoint();
        console.log(`apply: ${completed}/${allDecisions.length} — ${d.wineId} [uploaded]`);
      } catch (err) {
        completed++;
        console.error(`apply: ${completed}/${allDecisions.length} — ${d.wineId} FAILED: ${(err as Error).message}`);
      }
    }
  };

  await Promise.all(Array.from({ length: concurrency }, (_, i) => worker(i)));
  writeCheckpoint();

  // Now apply all URL updates sequentially to data/wines.ts
  console.log(`apply: rewriting data/wines.ts with ${results.length} updates`);
  let src = readFileSync(WINES_FILE, 'utf-8');
  let written = 0;
  for (const r of results) {
    const next = updateWineImageInSource(src, r.wineId, r.newUrl);
    if (next === src) {
      console.warn(`[apply] no-op for ${r.wineId} (id not found in data/wines.ts)`);
      continue;
    }
    src = next;
    written++;
  }
  writeFileSync(WINES_FILE, src);
  console.log(`apply: wrote ${written}/${results.length} image updates to data/wines.ts`);
}
