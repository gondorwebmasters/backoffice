import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SUPERADMIN_COOKIE, TOKEN_COOKIE } from "./lib/constants";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasToken = request.cookies.has(TOKEN_COOKIE);
  const isLoginPage = pathname === "/login";

  if (!hasToken && !isLoginPage) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasToken && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/system") && request.cookies.get(SUPERADMIN_COOKIE)?.value !== "1") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
