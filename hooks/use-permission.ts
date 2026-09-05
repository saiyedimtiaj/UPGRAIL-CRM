"use client"

import * as React from "react"
import { useMe } from "@/features/use-auth"

/**
 * What the signed-in user's role is allowed to do.
 *
 * Reads the permission list already attached to `me`, so gating costs no extra
 * request and does not flicker. The backend enforces the same keys on every
 * route — this only decides what to render, never what is allowed.
 */
export function usePermissions() {
  const { data: me, isPending } = useMe()

  return React.useMemo(() => {
    const held = new Set(me?.permissions ?? [])
    // Owners hold everything implicitly, including permissions added by a
    // later release — mirrors PermissionsGuard on the server.
    const isOwner = me?.isOwner ?? false

    const can = (key: string) => isOwner || held.has(key)

    return {
      can,
      /** True when any one of the keys is held. */
      canAny: (...keys: string[]) => keys.some(can),
      /** True only when every key is held. */
      canAll: (...keys: string[]) => keys.every(can),
      isOwner,
      /** Still loading `me` — treat as "don't know yet", not "denied". */
      isPending,
    }
  }, [me, isPending])
}
