import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { normalizeToPortrait, fetchImage, isPrivateOrReservedIP } from '../../scripts/v2/normalize';

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

describe('isPrivateOrReservedIP', () => {
  it.each([
    '10.0.0.1', '10.255.255.255',
    '127.0.0.1', '127.1.2.3',
    '169.254.169.254',  // EC2 metadata
    '172.16.0.1', '172.31.255.255',
    '192.168.0.1',
    '100.64.0.1',
    '0.0.0.0',
    '224.0.0.1',        // multicast
    '::1',              // IPv6 loopback
    '::',               // IPv6 unspecified
    'fe80::1',          // link-local
    'fc00::1', 'fd00::1', // ULA
    'ff00::1',          // multicast
    '::ffff:10.0.0.1',  // IPv4-mapped private
    'not-an-ip',        // invalid → unsafe
  ])('rejects %s', (ip) => {
    expect(isPrivateOrReservedIP(ip)).toBe(true);
  });

  it.each(['8.8.8.8', '1.1.1.1', '104.21.23.17', '2606:4700::1', '::ffff:8.8.8.8'])(
    'allows public %s',
    (ip) => {
      expect(isPrivateOrReservedIP(ip)).toBe(false);
    }
  );
});

describe('fetchImage SSRF guards', () => {
  it('rejects non-http(s) schemes', async () => {
    await expect(fetchImage('file:///etc/passwd')).rejects.toThrow(/bad-scheme/);
    await expect(fetchImage('javascript:alert(1)')).rejects.toThrow(/bad-scheme/);
    await expect(fetchImage('data:image/png;base64,AAA')).rejects.toThrow(/bad-scheme/);
  });

  it('rejects malformed URL', async () => {
    await expect(fetchImage('not a url')).rejects.toThrow(/bad-url/);
  });

  it('rejects IP-literal private hosts', async () => {
    await expect(fetchImage('http://127.0.0.1/x.jpg')).rejects.toThrow(/private-ip/);
    await expect(fetchImage('http://169.254.169.254/latest/meta-data/')).rejects.toThrow(/private-ip/);
    await expect(fetchImage('http://10.0.0.5/x.jpg')).rejects.toThrow(/private-ip/);
    await expect(fetchImage('http://[::1]/x.jpg')).rejects.toThrow(/private-ip/);
  });

  it('rejects hostnames that DNS-resolve to private IPs', async () => {
    // localhost always resolves to 127.0.0.1 / ::1
    await expect(fetchImage('http://localhost/x.jpg')).rejects.toThrow(/private-ip/);
  });
});
