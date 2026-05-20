import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that don't need authentication
const PUBLIC_ROUTES = ["/login", "/forgot-password", "/reset-password"];

// Routes that should redirect to dashboard if already logged in
const AUTH_ROUTES = ["/login", "/forgot-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for refresh token cookie as proxy for "logged in"
  // The access token is in memory only — cookie is our persistence signal
  const refreshToken = request.cookies.get("hms_refresh")?.value;

  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  // Not logged in and trying to access protected route
  if (!isPublic && !refreshToken) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Already logged in and trying to access auth pages
  if (isAuthRoute && refreshToken) {
    return NextResponse.redirect(new URL("/hotels", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api routes
     * - Next.js internals (_next)
     * - static files (favicon, images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)",
  ],
};
