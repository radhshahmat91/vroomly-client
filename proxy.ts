import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Optimistic guard for private routes: if there is no session cookie at all, send the visitor to the
 * login page and bring them back afterwards. The real role checks happen in <RequireAuth /> and in the API.
 * (Next.js 16 renamed "middleware" to "proxy".)
 */
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    const login = new URL("/login", request.url);
    login.searchParams.set("redirect", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/owner/:path*", "/admin/:path*", "/checkout/:path*", "/profile", "/notifications"],
};
