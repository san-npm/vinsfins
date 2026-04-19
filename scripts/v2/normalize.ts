import sharp from 'sharp';
import dns from 'dns/promises';
import net from 'net';

const TARGET_W = 800;
const TARGET_H = 1200;
const MAX_REDIRECTS = 3;

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

/**
 * Returns true if the IP is in a private, loopback, link-local, or otherwise
 * reserved range that should never be reachable from external image fetches.
 */
export function isPrivateOrReservedIP(ip: string): boolean {
  const family = net.isIP(ip);
  if (family === 0) return true; // not a valid IP — treat as unsafe

  if (family === 4) {
    const parts = ip.split('.').map((n) => parseInt(n, 10));
    if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return true;
    const [a, b] = parts;
    if (a === 10) return true;                          // 10.0.0.0/8
    if (a === 127) return true;                         // 127.0.0.0/8 loopback
    if (a === 0) return true;                           // 0.0.0.0/8
    if (a === 169 && b === 254) return true;            // 169.254.0.0/16 link-local (EC2 metadata)
    if (a === 172 && b >= 16 && b <= 31) return true;   // 172.16.0.0/12
    if (a === 192 && b === 168) return true;            // 192.168.0.0/16
    if (a === 100 && b >= 64 && b <= 127) return true;  // 100.64.0.0/10 CGN
    if (a === 198 && (b === 18 || b === 19)) return true; // benchmarks
    if (a >= 224) return true;                          // multicast + reserved
    return false;
  }

  // IPv6
  const lower = ip.toLowerCase();
  if (lower === '::1') return true;                     // loopback
  if (lower === '::') return true;                      // unspecified
  if (lower.startsWith('fe80:') || lower.startsWith('fe8')) return true; // link-local fe80::/10
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true;     // ULA fc00::/7
  if (lower.startsWith('ff')) return true;              // multicast
  // IPv4-mapped: ::ffff:10.0.0.1
  const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateOrReservedIP(mapped[1]);
  return false;
}

/**
 * Validates a URL for outbound image fetching. Rejects non-http(s) schemes and
 * hostnames that resolve to private/reserved IPs. Returns the resolved URL
 * object on success; throws a typed error on rejection.
 */
async function assertSafeOutboundUrl(rawUrl: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error(`bad-url:${rawUrl.slice(0, 80)}`);
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`bad-scheme:${parsed.protocol}`);
  }

  // Node URL keeps IPv6 literals wrapped in brackets (e.g. "[::1]"); strip them.
  const host = parsed.hostname.replace(/^\[|\]$/g, '');

  // If the host is an IP literal, validate it directly.
  if (net.isIP(host)) {
    if (isPrivateOrReservedIP(host)) {
      throw new Error(`private-ip:${host}`);
    }
    return parsed;
  }

  // Otherwise, resolve DNS and reject if any answer is private.
  const addrs = await dns.lookup(host, { all: true });
  if (addrs.length === 0) throw new Error(`dns-empty:${host}`);
  for (const a of addrs) {
    if (isPrivateOrReservedIP(a.address)) {
      throw new Error(`private-ip-dns:${host}->${a.address}`);
    }
  }
  return parsed;
}

/**
 * Fetch an image with SSRF guards: scheme allowlist, per-hop DNS validation
 * against private/reserved IP ranges, and bounded manual redirect handling.
 * Content-type must be image/*. Throws on any rejection; caller decides
 * whether to drop the candidate.
 */
export async function fetchImage(url: string, timeoutMs = 15_000): Promise<Buffer> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let current = url;
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      await assertSafeOutboundUrl(current);
      const res = await fetch(current, {
        signal: controller.signal,
        redirect: 'manual',
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VinsFins/2.0)' },
      });

      // Manual redirect handling — validate each hop.
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get('location');
        if (!loc) throw new Error(`redirect-no-location:${res.status}`);
        if (hop === MAX_REDIRECTS) throw new Error(`too-many-redirects`);
        current = new URL(loc, current).toString();
        continue;
      }

      if (!res.ok) throw new Error(`fetch-failed:${res.status}`);
      const ct = res.headers.get('content-type') || '';
      if (!ct.startsWith('image/')) throw new Error(`not-an-image:${ct}`);
      return Buffer.from(await res.arrayBuffer());
    }
    throw new Error(`unreachable`);
  } finally {
    clearTimeout(t);
  }
}
