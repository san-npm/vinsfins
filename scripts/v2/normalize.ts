import sharp from 'sharp';

const TARGET_W = 800;
const TARGET_H = 1200;

export async function normalizeToPortrait(inputBuffer: Buffer): Promise<Buffer> {
  return sharp(inputBuffer)
    .resize(TARGET_W, TARGET_H, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();
}

export async function fetchImage(url: string, timeoutMs = 15_000): Promise<Buffer> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  const res = await fetch(url, {
    signal: controller.signal,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VinsFins/2.0)' },
  });
  clearTimeout(t);
  if (!res.ok) throw new Error(`fetch-failed:${res.status}`);
  const ct = res.headers.get('content-type') || '';
  if (!ct.startsWith('image/')) throw new Error(`not-an-image:${ct}`);
  return Buffer.from(await res.arrayBuffer());
}
