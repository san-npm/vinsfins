import { describe, it, expect } from 'vitest';
import { scoreCandidate, WINE_RETAILER_DOMAINS } from '../../scripts/v2/validate';

const antidootWine = {
  id: 'beer-woopwoop-sous-voile-antidoot-0-75cl',
  name: 'BEER WoopWoop sous voile ANTIDOOT 0,75cl',
  region: '', country: 'Belgium', grape: 'Craft brew',
  category: 'beer' as const,
  image: '',
};

describe('scoreCandidate', () => {
  it('rejects Voodoo Ranger (no producer token, blocked visual cues)', () => {
    const r = scoreCandidate(antidootWine, {
      imageUrl: 'https://cdn.shopify.com/s/files/x/Vootique_HerowithBottle_Blue.jpg',
      sourcePageUrl: 'https://shopify.com/x',
      sourcePageTitle: 'New Belgium Voodoo Ranger IPA',
      source: 'bing',
      width: 4472, height: 4472,
    });
    expect(r.confidence).toBe('NONE');
  });

  it('returns HIGH or MEDIUM for portrait vivino hit with producer + wine tokens', () => {
    const r = scoreCandidate(antidootWine, {
      imageUrl: 'https://images.vivino.com/thumbs/antidoot-woopwoop-sous-voile_x600.png',
      sourcePageUrl: 'https://www.vivino.com/antidoot-woopwoop-sous-voile',
      sourcePageTitle: 'Antidoot WoopWoop sous voile',
      source: 'vivino',
      width: 600, height: 900,
    });
    expect(r.metrics.producerTokenHit).toBe(true);
    expect(r.metrics.wineTokenCount).toBeGreaterThanOrEqual(2);
    expect(['HIGH', 'MEDIUM']).toContain(r.confidence);
  });

  it('returns NONE when aspect is wrong', () => {
    const r = scoreCandidate(antidootWine, {
      imageUrl: 'https://vivino.com/antidoot-woopwoop.jpg',
      sourcePageUrl: '', sourcePageTitle: 'Antidoot WoopWoop voile',
      source: 'vivino',
      width: 1200, height: 800,
    });
    expect(r.confidence).toBe('NONE');
  });

  it('returns NONE for blocked domain', () => {
    const r = scoreCandidate(antidootWine, {
      imageUrl: 'https://pinterest.com/pin/x.jpg',
      sourcePageUrl: '', sourcePageTitle: 'Antidoot WoopWoop voile',
      source: 'bing',
      width: 600, height: 900,
    });
    expect(r.confidence).toBe('NONE');
  });
});
