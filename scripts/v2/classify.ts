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
