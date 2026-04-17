import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { normalizeToPortrait } from '../../scripts/v2/normalize';

describe('normalizeToPortrait', () => {
  it('outputs 800x1200 JPEG with white padding for square source', async () => {
    const square = await sharp({ create: { width: 500, height: 500, channels: 3, background: '#c33' } }).jpeg().toBuffer();
    const out = await normalizeToPortrait(square);
    const meta = await sharp(out).metadata();
    expect(meta.width).toBe(800);
    expect(meta.height).toBe(1200);
    expect(meta.format).toBe('jpeg');
  });

  it('preserves aspect when source is already portrait', async () => {
    const tall = await sharp({ create: { width: 600, height: 900, channels: 3, background: '#3c3' } }).jpeg().toBuffer();
    const out = await normalizeToPortrait(tall);
    const meta = await sharp(out).metadata();
    expect(meta.width).toBe(800);
    expect(meta.height).toBe(1200);
  });
});
