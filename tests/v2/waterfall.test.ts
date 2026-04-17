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
