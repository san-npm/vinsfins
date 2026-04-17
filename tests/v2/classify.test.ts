import { describe, it, expect } from 'vitest';
import { classifyWine } from '../../scripts/v2/classify';
import type { Wine, Candidate } from '../../scripts/v2/types';

const wine: Wine = { id: 'x', name: 'Domaine Gramenon La Sagesse 2022', region: 'Rhône', country: 'FR', grape: 'Grenache', category: 'red', image: '' };

describe('classifyWine', () => {
  it('auto-accepts when at least one candidate is HIGH', async () => {
    const cands: Candidate[] = [{
      imageUrl: 'https://images.vivino.com/thumbs/gramenon-sagesse_x600.png',
      sourcePageUrl: 'https://vivino.com/gramenon-sagesse',
      sourcePageTitle: 'Domaine Gramenon La Sagesse',
      source: 'vivino', width: 600, height: 900,
    }];
    const r = await classifyWine(wine, cands, { fetchBuffers: false });
    expect(r.decision).toBe('auto-accept');
    expect(r.chosen?.validation.confidence).toBe('HIGH');
  });

  it('flags when no candidate is HIGH', async () => {
    const cands: Candidate[] = [{
      imageUrl: 'https://cdn.shopify.com/voodoo-ranger.jpg',
      sourcePageUrl: '', sourcePageTitle: 'Voodoo Ranger',
      source: 'bing', width: 4000, height: 4000,
    }];
    const r = await classifyWine(wine, cands, { fetchBuffers: false });
    expect(r.decision).toBe('flag');
  });

  it('flags with empty candidates list', async () => {
    const r = await classifyWine(wine, [], { fetchBuffers: false });
    expect(r.decision).toBe('flag');
    expect(r.candidates.length).toBe(0);
  });
});
