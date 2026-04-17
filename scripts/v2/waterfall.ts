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
