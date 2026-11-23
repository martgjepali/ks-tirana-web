import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["sq", "en"];
const defaultLocale = "sq";

function getPreferredLocale(request: NextRequest) {
  const header = request.headers.get("accept-language");
  if (header?.toLowerCase().startsWith("en")) return "en";
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  if (pathnameHasLocale) return NextResponse.next();

  const locale = getPreferredLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // The language redirect only applies to the public site. Skipped:
  //   /api    route handlers (auth, health, forms)
  //   /admin  staff panel (Albanian only, own root layout)
  //   /media  processed photo files
  // Each is matched as a whole segment, so e.g. /administrata still gets a language.
  matcher: [
    "/((?!_next|api(?:/|$)|admin(?:/|$)|media(?:/|$)|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|avif|ico|txt|xml)$).*)",
  ],
};
