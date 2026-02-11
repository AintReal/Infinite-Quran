import { NextRequest, NextResponse } from "next/server";
import { isValidLocale, type Locale } from "@/lib/i18n";

const arabCountries = new Set([
  "SA", "AE", "KW", "BH", "QA", "OM", "EG", "JO", "IQ", "PS", "LB", "SY",
  "YE", "LY", "TN", "DZ", "MA", "SD", "SO", "DJ", "MR",
]);
const malayCountries = new Set(["ID", "MY", "BN"]);

function detectLocale(req: NextRequest): Locale {
  const country = (
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    ""
  ).toUpperCase();

  if (arabCountries.has(country)) return "ar";
  if (malayCountries.has(country)) return "id";
  if (country === "FR") return "fr";
  return "en";
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/control") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/fonts") ||
    pathname.match(/\.(png|jpg|ico|svg|webmanifest|xml|txt)$/)
  ) {
    return NextResponse.next();
  }

  const firstSegment = pathname.split("/")[1];

  if (firstSegment && isValidLocale(firstSegment)) {
    return NextResponse.next();
  }

  const locale = detectLocale(req);

  if (firstSegment && /^\d+$/.test(firstSegment)) {
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, req.url));
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${locale}`, req.url));
  }

  return NextResponse.redirect(new URL(`/${locale}${pathname}`, req.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
