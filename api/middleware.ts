import { clerkMiddleware, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { withCSRFProtection } from "@/lib/csrf";
import { withCORSProtection } from "@/lib/cors";
import { hasRequestAdminRole, resolveRequestRole } from "@/lib/admin-access";

const PUBLIC_API_PREFIXES = ["/api/install", "/api/public", "/api/webhooks"];

function isPublicApiPath(pathname: string): boolean {
  if (pathname === "/api/csrf") {
    return true;
  }

  return PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const pathname = request.nextUrl.pathname;
  const isApiRoute = pathname.startsWith("/api/");

  if (!isApiRoute) {
    return NextResponse.next();
  }

  if (isPublicApiPath(pathname)) {
    return withCORSProtection(request, async () => NextResponse.next());
  }

  return withCORSProtection(request, async (req) => {
    return withCSRFProtection(req, async () => {
      const { userId, sessionClaims } = await auth();

      if (!userId) {
        return NextResponse.json(
          { error: "You are not connected" },
          { status: 401 }
        );
      }

      if (!pathname.startsWith("/api/admin")) {
        return NextResponse.next();
      }

      const user = await (await clerkClient()).users.getUser(userId);

      if (!hasRequestAdminRole({ user, sessionClaims })) {
        return NextResponse.json(
          {
            error: "Forbidden",
            message: "Admin role required",
            role: resolveRequestRole({ user, sessionClaims }) ?? "none",
          },
          { status: 403 }
        );
      }

      return NextResponse.next();
    });
  });
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
