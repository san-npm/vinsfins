import { describe, it, expect } from 'vitest';
import { updateWineImageInSource } from '../../scripts/v2/apply';

describe('updateWineImageInSource', () => {
  it('replaces the image URL for a given wine id', () => {
    const src = `
  {
    id: 'gramenon-sagesse-2022',
    name: 'La Sagesse',
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
});
