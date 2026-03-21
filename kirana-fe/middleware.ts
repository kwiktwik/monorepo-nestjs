import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Check if the request is coming from sangamapp.in
  const isSangamDomain = hostname.includes("sangamapp.in");

  if (isSangamDomain) {
    const { pathname } = url;

    // Route mappings for Sangam domain
    if (pathname === "/") {
      return NextResponse.rewrite(new URL("/sangam", request.url));
    }

    if (pathname === "/privacy-policy") {
      return NextResponse.rewrite(new URL("/sangam-privacy", request.url));
    }

    if (pathname === "/terms-of-service") {
      return NextResponse.rewrite(new URL("/sangam-terms", request.url));
    }

    if (pathname === "/delete-account") {
      return NextResponse.rewrite(new URL("/sangam-delete-account", request.url));
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
