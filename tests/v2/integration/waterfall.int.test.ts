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
