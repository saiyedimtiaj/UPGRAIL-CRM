"use client"

import { usePathname } from "next/navigation"

import { permissionForPath } from "@/lib/route-permissions"
import { resolvePageMeta } from "@/lib/nav"
import { usePermissions } from "@/hooks/use-permission"
import { LockScreen } from "@/components/primitives/lock-screen"

/**
 * Blocks a page the role may not open.
 *
 * Deliberately renders a component instead of calling `redirect()`: a redirect
 * from a page component races with PageTransition's AnimatePresence and crashes
 * with "Rendered more hooks than during the previous render" — the reason the
 * settings redirect lives in proxy.ts rather than in a page.
 *
 * Wrapping here rather than in each page also means a new route is guarded by
 * default: if it is listed in ROUTE_PERMISSIONS, it is protected.
 */
export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { can, isPending } = usePermissions()

  const permission = permissionForPath(pathname)

  // Render nothing until permissions are known, so a page never flashes up
  // and then vanishes.
  if (isPending) return null

  if (permission && !can(permission)) {
    const meta = resolvePageMeta(pathname)
    return (
      <LockScreen
        title={`${meta.title} is restricted`}
        description="Your role does not include access to this page. An owner can grant it from Settings → Roles & Permissions."
        permission={permission}
      />
    )
  }

  return <>{children}</>
}
