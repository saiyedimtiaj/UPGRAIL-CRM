"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"

import { meQueryKey } from "@/features/use-auth"
import type { TUser } from "@/types/auth.types"

/**
 * Seeds the query cache with the user the server already resolved.
 *
 * Without this the admin shell would mount, discover `useMe()` has no data,
 * and fire a request the server had just made — so the sidebar and topbar sat
 * empty for a full round trip on every cold load. Writing the cache during
 * render (rather than in an effect) means the first paint already has it.
 */
export function AuthHydration({
  user,
  children,
}: {
  user: TUser
  children: React.ReactNode
}) {
  const queryClient = useQueryClient()

  // useState initialiser runs once per mount, before children render.
  React.useState(() => {
    queryClient.setQueryData(meQueryKey, user)
  })

  return <>{children}</>
}
