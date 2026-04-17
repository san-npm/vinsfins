import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { updateWineImageInSource } from '../../scripts/v2/apply';

describe('updateWineImageInSource', () => {
  it('replaces the image URL for a given wine id', () => {
    const src = `
  {
    id: 'gramenon-sagesse-2022',
    name: 'La Sagesse',
    region: 'Rhône', country: 'France', grape: 'Grenache',
    description: {
      fr: 'Un vin du Rhône',
      en: 'A Rhône wine',
      de: 'Ein Rhône-Wein',
      lb: 'E Rhône-Wäin',
    },
    image: 'https://old.example.com/x.jpg',
    isAvailable: true,
  },`;
    const out = updateWineImageInSource(src, 'gramenon-sagesse-2022', 'https://new.example.com/y.jpg');
    expect(out).toContain("image: 'https://new.example.com/y.jpg'");
    expect(out).not.toContain('https://old.example.com/x.jpg');
  });

  it('is a no-op when wine id not present', () => {
    const src = `{ id: 'other', image: 'https://x.jpg' },`;
    const out = updateWineImageInSource(src, 'missing', 'https://new.jpg');
    expect(out).toBe(src);
  });

  it('works on the real data/wines.ts format', () => {
    const src = readFileSync(join(__dirname, '../../data/wines.ts'), 'utf-8');
    // pick an id that exists — use the first id found
    const idMatch = src.match(/id:\s*'([^']+)'/);
    if (!idMatch) throw new Error('no wine id found in data/wines.ts');
    const id = idMatch[1];
    const out = updateWineImageInSource(src, id, 'https://blob.example.com/test.jpg');
    expect(out).not.toBe(src); // must have changed something
    expect(out).toContain("image: 'https://blob.example.com/test.jpg'");
  });
});
