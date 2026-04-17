import { describe, it, expect, vi } from 'vitest';
import { auditOne } from '../../scripts/v2/audit';
import type { Wine } from '../../scripts/v2/types';

const wine: Wine = {
  id: 'test-1',
  name: 'Domaine Gramenon La Sagesse 2022',
  region: 'Rhône', country: 'France', grape: 'Grenache',
  category: 'red',
  image: 'https://example.com/broken.jpg',
};

describe('auditOne', () => {
  it('returns passed=false when fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 404 })));
    const r = await auditOne(wine);
    expect(r.passed).toBe(false);
    expect(r.result.reasons[0]).toMatch(/fetch|http/);
    vi.unstubAllGlobals();
  });
});
