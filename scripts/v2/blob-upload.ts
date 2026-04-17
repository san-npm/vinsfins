import { put, del } from '@vercel/blob';

export async function uploadWineImage(wineId: string, buffer: Buffer): Promise<string> {
  const key = `vinsfins/images/v2/${wineId}.jpg`;
  const res = await put(key, buffer, {
    access: 'public',
    addRandomSuffix: false,
    cacheControlMaxAge: 31_536_000,
    contentType: 'image/jpeg',
    allowOverwrite: true,
  });
  return res.url;
}

export async function deleteOldWineImage(wineId: string, ext: 'jpg' | 'png' | 'webp'): Promise<void> {
  const key = `vinsfins/images/${wineId}.${ext}`;
  try {
    await del(key);
  } catch (err) {
    const msg = (err as Error).message;
    if (!msg.includes('not_found') && !msg.includes('404')) throw err;
  }
}
