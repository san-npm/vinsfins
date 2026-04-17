import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseProducerPage } from '../../../scripts/v2/sources/producer';

describe('parseProducerPage', () => {
  it('extracts og:image and title', () => {
    const html = readFileSync(join(__dirname, '../fixtures/producer-antidoot.html'), 'utf-8');
    const cands = parseProducerPage(html, 'https://antidoot.be');
    expect(cands[0].imageUrl).toBe('https://antidoot.be/media/woopwoop-sous-voile.jpg');
    expect(cands[0].sourcePageTitle).toContain('Antidoot');
    expect(cands[0].source).toBe('producer');
  });
});
