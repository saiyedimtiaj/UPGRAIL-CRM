"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"

import { meQueryKey } from "@/features/use-auth"
import type { TUser } from "@/types/auth.types"

export function AuthHydration({
  user,
  children,
}: {
  user: TUser
  children: React.ReactNode
}) {
  const queryClient = useQueryClient()

  React.useState(() => {
    queryClient.setQueryData(meQueryKey, user)
  })

  return <>{children}</>
}
