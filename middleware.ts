import { NextRequest, NextResponse } from "next/server";

const locales = ["fr", "en", "de", "lb"];
const defaultLocale = "fr";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip non-page routes
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Extract potential locale prefix
  const segments = pathname.split("/");
  const maybeLocale = segments[1];

  if (locales.includes(maybeLocale)) {
    const locale = maybeLocale;
    const restPath = "/" + segments.slice(2).join("/");
    const cleanPath = restPath === "/" ? "/" : restPath.replace(/\/$/, "");

    if (locale === defaultLocale) {
      // /fr/carte → 301 redirect to /carte (French is canonical, no prefix)
      return NextResponse.redirect(new URL(cleanPath, request.url), 301);
    }

    // /en/carte → rewrite to /carte, pass locale via request header
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-locale", locale);

    const response = NextResponse.rewrite(new URL(cleanPath, request.url), {
      request: { headers: requestHeaders },
    });
    response.cookies.set("locale", locale, { path: "/", maxAge: 31536000 });
    return response;
  }

  // No prefix → French (default)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", "fr");

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  // Set cookie for French too (so client-side knows)
  response.cookies.set("locale", "fr", { path: "/", maxAge: 31536000 });
  return response;
}

export const config = {
  matcher: [
    "/((?!_next|api|admin|favicon\\.ico|robots\\.txt|sitemap\\.xml|og-image|llms\\.txt|images|icons).*)",
  ],
};
