import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseVivinoResults } from '../../../scripts/v2/sources/vivino';

describe('parseVivinoResults', () => {
  it('extracts image URL and title from search HTML', () => {
    const html = readFileSync(join(__dirname, '../fixtures/vivino-antidoot.html'), 'utf-8');
    const cands = parseVivinoResults(html);
    expect(cands.length).toBeGreaterThan(0);
    expect(cands[0].imageUrl).toMatch(/vivino\.com/);
    expect(cands[0].source).toBe('vivino');
    expect(cands[0].sourcePageTitle).toBeTruthy();
  });
});
