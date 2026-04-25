/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "www.bodeboca.com" },
      { protocol: "https", hostname: "hungarianwines.eu" },
      { protocol: "https", hostname: "wine-amazing.com" },
      { protocol: "https", hostname: "www.architectureinterieureduvin.com" },
      { protocol: "https", hostname: "sharewinecdn.azureedge.net" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // CSP is now set per-request by middleware.ts so we can
          // rotate the `script-src` nonce on every response. Keeping
          // a static policy here would force us back to
          // `'unsafe-inline'` which defeats XSS mitigation.
        ],
      },
    ];
  },
};

export default nextConfig;
