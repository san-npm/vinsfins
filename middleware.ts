import { NextRequest, NextResponse } from "next/server";

const locales = ["fr", "en", "de", "lb"];
const defaultLocale = "fr";

function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    // `'strict-dynamic'` tells modern browsers to trust only scripts
    // carrying this response's nonce (plus anything those scripts
    // load via DOM APIs). Legacy browsers fall back to 'self' + host
    // allowlist. `'unsafe-inline'` is intentionally omitted — that
    // was the weakness the previous CSP left open.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://sdk.zenchef.com https://*.zenchef.com https://www.googletagmanager.com https://js.stripe.com`,
    "style-src 'self' 'unsafe-inline' https://*.zenchef.com",
    "font-src 'self' https://*.zenchef.com",
    "img-src 'self' data: blob: https: https://*.public.blob.vercel-storage.com https://*.zenchef.com https://*.stripe.com",
    "frame-src https://www.google.com https://*.google.com https://*.zenchef.com https://js.stripe.com https://hooks.stripe.com",
    "connect-src 'self' https://*.public.blob.vercel-storage.com https://sdk.zenchef.com https://*.zenchef.com https://api.stripe.com https://www.google-analytics.com https://*.analytics.google.com https://*.google-analytics.com https://www.googletagmanager.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://checkout.stripe.com",
    "frame-ancestors 'none'",
  ].join("; ");
}

function addCsp(response: NextResponse, nonce: string): NextResponse {
  response.headers.set("Content-Security-Policy", buildCsp(nonce));
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API responses are not HTML — no CSP needed.
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Generate a fresh nonce per request for inline scripts.
  const nonce = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString("base64");

  // Admin + static assets: no locale handling, just propagate nonce + CSP.
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-nonce", nonce);
    return addCsp(NextResponse.next({ request: { headers: requestHeaders } }), nonce);
  }

  // Extract potential locale prefix
  const segments = pathname.split("/");
  const maybeLocale = segments[1];

  if (locales.includes(maybeLocale)) {
    const locale = maybeLocale;
    const restPath = "/" + segments.slice(2).join("/");
    // Collapse any repeated slashes so `/en//evil.com` can never be
    // interpreted as an absolute URL (with `evil.com` as host) when
    // passed to `new URL(cleanPath, request.url)`. Without this, an
    // attacker-controlled path becomes an open redirect for the
    // default locale or an external rewrite for the others.
    const safePath = restPath.replace(/\/+/g, "/");
    const cleanPath = safePath === "/" ? "/" : safePath.replace(/\/$/, "");

    if (locale === defaultLocale) {
      // /fr/carte → 301 redirect to /carte (French is canonical, no prefix).
      // The redirect response body is empty, so no CSP is needed here —
      // the follow-up request to the canonical path will get its own.
      return NextResponse.redirect(new URL(cleanPath, request.url), 301);
    }

    // /en/carte → rewrite to /carte, pass locale + nonce via request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-locale", locale);
    requestHeaders.set("x-nonce", nonce);

    const response = NextResponse.rewrite(new URL(cleanPath, request.url), {
      request: { headers: requestHeaders },
    });
    response.cookies.set("locale", locale, { path: "/", maxAge: 31536000, secure: true, sameSite: "lax" });
    return addCsp(response, nonce);
  }

  // No prefix → French (default)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", "fr");
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  // Set cookie for French too (so client-side knows)
  response.cookies.set("locale", "fr", { path: "/", maxAge: 31536000, secure: true, sameSite: "lax" });
  return addCsp(response, nonce);
}

export const config = {
  matcher: [
    "/((?!_next|api|admin|favicon\\.ico|robots\\.txt|sitemap\\.xml|og-image|llms\\.txt|images|icons).*)",
  ],
};
