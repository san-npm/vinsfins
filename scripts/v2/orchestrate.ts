import { wines as allWines } from '../../data/wines';
import type { Wine, AuditRecord, ClassifiedRecord } from './types';
import { readState } from './state';
import { runAudit } from './audit';
import { runWaterfall } from './waterfall';
import { runClassify } from './classify';
import { runApply, type MinConfidence } from './apply';

const stage = (process.argv.find((a) => a.startsWith('--stage='))?.split('=')[1] ?? 'all') as
  | 'audit' | 'scrape' | 'classify' | 'review' | 'apply' | 'all';

const limitArg = process.argv.find((a) => a.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;
const wines = (allWines as Wine[]).slice(0, limit);

const minConfidenceArg = process.argv.find((a) => a.startsWith('--min-confidence='));
const minConfidence = (minConfidenceArg?.split('=')[1]?.toUpperCase() ?? 'HIGH') as MinConfidence;

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
    console.log(`=== APPLY === (min-confidence=${minConfidence})`);
    await runApply(4, minConfidence);
  }

  console.log('\n=== SUMMARY ===');
  const audit = readState<AuditRecord>('scripts/v2/state/audit.json');
  const classified = readState<ClassifiedRecord>('scripts/v2/state/classified.json');
  console.log(`audited: ${audit.length}, passed: ${audit.filter((r) => r.passed).length}`);
  console.log(`classified: ${classified.length}, auto-accept: ${classified.filter((c) => c.decision === 'auto-accept').length}, flagged: ${classified.filter((c) => c.decision === 'flag').length}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
