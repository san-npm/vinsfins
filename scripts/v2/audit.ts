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
