/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cmbsxh7oipaip57r.public.blob.vercel-storage.com" },
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
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://sdk.zenchef.com https://*.zenchef.com https://www.googletagmanager.com https://js.stripe.com",
              "style-src 'self' 'unsafe-inline' https://*.zenchef.com",
              "font-src 'self' https://*.zenchef.com",
              "img-src 'self' data: blob: https: https://*.public.blob.vercel-storage.com https://*.zenchef.com https://*.stripe.com",
              "frame-src https://www.google.com https://*.google.com https://*.zenchef.com https://js.stripe.com https://hooks.stripe.com",
              "connect-src 'self' https://*.public.blob.vercel-storage.com https://sdk.zenchef.com https://*.zenchef.com https://api.stripe.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
