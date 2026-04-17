import sharp from 'sharp';
import type { Wine, Candidate, ClassifiedRecord, ValidationResult } from './types';
import { scoreCandidate } from './validate';
import { cornerVariance } from './corner-variance';
import { fetchImage } from './normalize';
import { extractProducerToken, extractWineTokens } from './tokens';
import { readState, writeState } from './state';

const CLASSIFIED_STATE = 'scripts/v2/state/classified.json';
const FETCH_TOP_N = 6;

export interface ClassifyOpts { fetchBuffers?: boolean; topN?: number }

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

function urlScore(wine: Wine, cand: Candidate): number {
  const producer = extractProducerToken(wine.name);
  const wineTokens = extractWineTokens(wine.name, producer);
  const haystack = (cand.imageUrl + ' ' + cand.sourcePageUrl + ' ' + cand.sourcePageTitle).toLowerCase();
  let score = 0;
  if (producer && haystack.includes(producer)) score += 10;
  score += wineTokens.filter((t) => haystack.includes(t)).length * 3;
  try {
    const host = new URL(cand.imageUrl).hostname.toLowerCase();
    if (/(wine|vin|vino|cellar|winery|vineyard|enoteca)/.test(host)) score += 3;
  } catch {}
  return score;
}

export async function classifyWine(
  wine: Wine,
  candidates: Candidate[],
  opts: ClassifyOpts = { fetchBuffers: true, topN: FETCH_TOP_N }
): Promise<ClassifiedRecord> {
  const topN = opts.topN ?? FETCH_TOP_N;
  const ranked = candidates
    .map((c) => ({ cand: c, preScore: urlScore(wine, c) }))
    .sort((a, b) => b.preScore - a.preScore);

  const top = ranked.slice(0, topN);
  const rest = ranked.slice(topN);

  const scored: Array<Candidate & { validation: ValidationResult }> = [];

  if (opts.fetchBuffers) {
    const settled = await Promise.all(
      top.map(async ({ cand }) => {
        const filled = await fillDimensions(cand);
        const cv = filled.buf ? await cornerVariance(filled.buf).catch(() => undefined) : undefined;
        const validation = scoreCandidate(wine, filled.cand, cv);
        return { ...filled.cand, validation };
      })
    );
    scored.push(...settled);
  } else {
    for (const { cand } of top) {
      const validation = scoreCandidate(wine, cand);
      scored.push({ ...cand, validation });
    }
  }

  for (const { cand } of rest) {
    const validation = scoreCandidate(wine, cand);
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
  candidatesMap: Record<string, Candidate[]>,
  concurrency = 4
): Promise<ClassifiedRecord[]> {
  const existing = readState<ClassifiedRecord>(CLASSIFIED_STATE);
  const doneIds = new Set(existing.map((r) => r.wineId));
  const results = [...existing];
  const todo = wines.filter((w) => !doneIds.has(w.id));

  let completed = 0;
  const checkpoint = () => writeState(CLASSIFIED_STATE, results);

  const worker = async (startIdx: number) => {
    for (let i = startIdx; i < todo.length; i += concurrency) {
      const w = todo[i];
      const cands = candidatesMap[w.id] || [];
      const r = await classifyWine(w, cands);
      results.push(r);
      completed++;
      if (completed % 10 === 0) checkpoint();
      console.log(`classify: ${completed}/${todo.length} — ${w.id} [${r.decision}]`);
    }
  };

  await Promise.all(Array.from({ length: concurrency }, (_, i) => worker(i)));
  checkpoint();
  return results;
}
