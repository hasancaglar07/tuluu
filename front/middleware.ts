import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { i18n } from "./i18n-config";
const { locales, defaultLocale } = i18n;

/**Clerk middleware */
const isAuthRoute = createRouteMatcher([
  "/profile(.*)",
  "/subscriptions(.*)",
  "/leaderborad(.*)",
  "/learn(.*)",
  "/dashboard(.*)",
  "/quests(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, request: NextRequest) => {
  // Bypass locale rewrite and auth for API routes
  if (
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname.startsWith("/_api")
  ) {
    return NextResponse.next();
  }
  const { userId } = await auth();
  if (isAuthRoute(request) && !userId)
    return NextResponse.redirect(new URL("/sign-in", request.url));

  // Protect admin routes
  if (isAdminRoute(request)) {
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  // Rewrite URL for locale (only Turkish is supported)
  let response: NextResponse;
  const { basePath, pathname, search } = request.nextUrl;
  const localePathPrefix = `/${defaultLocale}`;

  const pathLocale = locales.find(
    (locale) =>
      pathname.startsWith(`/${locale.lang}/`) || pathname === `/${locale.lang}`
  );

  if (pathLocale) {
    let pathWithoutLocale =
      pathname.slice(`/${pathLocale.lang}`.length) || "/";
    if (search) pathWithoutLocale += search;
    const url = basePath + pathWithoutLocale;
    response = NextResponse.redirect(new URL(url, request.url));
  } else {
    let localizedPath = `${localePathPrefix}${pathname}`;
    if (search) localizedPath += search;
    response = NextResponse.rewrite(new URL(basePath + localizedPath, request.url));
  }

  response.cookies.set("NEXT_LOCALE", defaultLocale);
  return response;
});

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    "/((?!_next|api|_api|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Optional: only run on root (/) URL
    // '/'
  ],
};
