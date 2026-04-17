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
  const lines = src.split('\n');
  const escapedId = wineId.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const idRe = new RegExp(`id:\\s*['"]${escapedId}['"]`);
  const imageRe = /^(\s*image:\s*)['"][^'"]*['"](.*)$/;
  for (let i = 0; i < lines.length; i++) {
    if (!idRe.test(lines[i])) continue;
    // scan up to 30 lines forward for the image field
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
