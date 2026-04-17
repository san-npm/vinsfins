import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseBingResults } from '../../../scripts/v2/sources/bing';

describe('parseBingResults', () => {
  it('extracts murl + title from Bing markup', () => {
    const html = readFileSync(join(__dirname, '../fixtures/bing-gramenon.html'), 'utf-8');
    const cands = parseBingResults(html);
    expect(cands.length).toBeGreaterThan(0);
    expect(cands[0].imageUrl).toBe('https://example.com/gramenon.jpg');
    expect(cands[0].source).toBe('bing');
  });
});
