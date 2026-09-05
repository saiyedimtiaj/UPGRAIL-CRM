"use client"

import { usePermissions } from "@/hooks/use-permission"

/**
 * Renders children only when the role holds one of the given permissions.
 *
 * Used to hide a section within an otherwise-visible page — the dashboard's
 * five panels, for instance. Renders nothing while `me` is still loading so a
 * hidden section never flashes into view before disappearing.
 */
export function IfPermitted({
  permission,
  fallback = null,
  children,
}: {
  permission: string | string[]
  fallback?: React.ReactNode
  children: React.ReactNode
}) {
  const { canAny, isPending } = usePermissions()

  if (isPending) return null

  const keys = Array.isArray(permission) ? permission : [permission]
  return canAny(...keys) ? <>{children}</> : <>{fallback}</>
}
