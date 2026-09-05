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


  // Resolved here rather than by a Server Component redirect(): doing it in a
  // page raced with PageTransition's AnimatePresence key={pathname} and crashed
  // with "Rendered more hooks than during the previous render."
  //
  // Aimed at Account, not Team: proxy.ts only sees a cookie and cannot read
  // permissions, and Account is the one tab every signed-in user may open. The
  // settings rail then shows whichever tabs the role actually has.
  if (pathname === "/admin/settings") {
    const url = request.nextUrl.clone()
    url.pathname = "/admin/settings/account"
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
