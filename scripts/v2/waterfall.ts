import type { Wine, Candidate } from './types';
import type { Source } from './sources';
import { SOURCES } from './sources';
import { readState, writeState } from './state';

const CANDIDATES_STATE = 'scripts/v2/state/candidates.json';

export async function runWaterfallForWine(wine: Wine, sources: Source[] = SOURCES): Promise<Candidate[]> {
  const all: Candidate[] = [];
  for (let i = 0; i < sources.length; i++) {
    const src = sources[i];
    try {
      const found = await src.search(wine);
      all.push(...found);
    } catch (err) {
      console.warn(`[waterfall] ${wine.id} source=${src.name} error=${(err as Error).message}`);
    }
    if (i < sources.length - 1) await sleep(800);
  }
  return all;
}

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

export async function runWaterfall(
  wines: Wine[],
  concurrency = 3
): Promise<Record<string, Candidate[]>> {
  const existing = readState<{ wineId: string; candidates: Candidate[] }>(CANDIDATES_STATE);
  const doneIds = new Set(existing.map((r) => r.wineId));
  const out: Record<string, Candidate[]> = Object.fromEntries(existing.map((r) => [r.wineId, r.candidates]));
  const todo = wines.filter((w) => !doneIds.has(w.id));

  let completed = 0;
  const writeCheckpoint = () => {
    const asList = Object.entries(out).map(([wineId, candidates]) => ({ wineId, candidates }));
    writeState(CANDIDATES_STATE, asList);
  };

  const worker = async (startIdx: number) => {
    for (let i = startIdx; i < todo.length; i += concurrency) {
      const w = todo[i];
      const cands = await runWaterfallForWine(w);
      out[w.id] = cands;
      completed++;
      if (completed % 5 === 0) writeCheckpoint();
      console.log(`waterfall: ${completed}/${todo.length} — ${w.id} (${cands.length} candidates)`);
    }
  };

  await Promise.all(Array.from({ length: concurrency }, (_, i) => worker(i)));
  writeCheckpoint();
  return out;
}
