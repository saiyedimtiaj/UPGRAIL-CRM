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

  // Resolved here (before any React tree mounts) rather than via a
  // Server Component redirect() in the page itself — doing it there raced
  // with PageTransition's AnimatePresence key={pathname}, letting the
  // 0-hook redirect stub and the many-hook Team page share one render
  // under the same key on first client-side navigation, which crashed
  // with "Rendered more hooks than during the previous render." A hard
  // refresh never showed it because the redirect was already fully
  // resolved server-side before the client ever mounted anything.
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
