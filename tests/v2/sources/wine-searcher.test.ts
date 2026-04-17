import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseWineSearcherResults } from '../../../scripts/v2/sources/wine-searcher';

describe('parseWineSearcherResults', () => {
  it('extracts candidates from search HTML', () => {
    const html = readFileSync(join(__dirname, '../fixtures/wine-searcher-gramenon.html'), 'utf-8');
    const cands = parseWineSearcherResults(html);
    expect(cands.length).toBeGreaterThan(0);
    expect(cands[0].source).toBe('wine-searcher');
  });
});
