import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"


const AUTH_ROUTES = ["/sign-in", "/forgot-password", "/reset-password"]
const PROTECTED_PREFIX = "/admin"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasToken = !!request.cookies.get("access_token")?.value

  if (pathname === "/") {
    const url = request.nextUrl.clone()
    url.pathname = hasToken ? "/admin" : "/sign-in"
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith(PROTECTED_PREFIX) && !hasToken) {
    const url = request.nextUrl.clone()
    url.pathname = "/sign-in"
    url.searchParams.set("from", pathname)
    return NextResponse.redirect(url)
  }

  if (pathname === "/admin/settings") {
    const url = request.nextUrl.clone()
    url.pathname = "/admin/settings/team"
    return NextResponse.redirect(url)
  }

  if (hasToken && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    const url = request.nextUrl.clone()
    url.pathname = "/admin"
    url.search = ""
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/",
    "/sign-in",
    "/forgot-password",
    "/reset-password",
    "/admin/:path*",
  ],
}
