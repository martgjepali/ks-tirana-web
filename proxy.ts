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
  matcher: ["/((?!_next|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico|txt|xml)$).*)"],
};
