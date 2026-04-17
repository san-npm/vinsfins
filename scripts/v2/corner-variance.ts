import sharp from 'sharp';

const PATCH = 50;

export async function cornerVariance(imageBuffer: Buffer): Promise<number> {
  const img = sharp(imageBuffer);
  const { width, height } = await img.metadata();
  if (!width || !height || width < PATCH * 2 || height < PATCH * 2) return 1;

  const corners = [
    { left: 0, top: 0 },
    { left: width - PATCH, top: 0 },
    { left: 0, top: height - PATCH },
    { left: width - PATCH, top: height - PATCH },
  ];

  let totalStdDev = 0;
  for (const c of corners) {
    const { data } = await sharp(imageBuffer)
      .extract({ ...c, width: PATCH, height: PATCH })
      .raw()
      .toBuffer({ resolveWithObject: true });
    const values = Array.from(data);
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
    totalStdDev += Math.sqrt(variance) / 255;
  }
  return totalStdDev / 4;
}
