import { NextRequest, NextResponse } from "next/server";
import { isValidLocale, defaultLocale } from "@/lib/i18n";

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

  if (firstSegment && /^\d+$/.test(firstSegment)) {
    return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}`, req.url));
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, req.url));
  }

  return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}`, req.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
