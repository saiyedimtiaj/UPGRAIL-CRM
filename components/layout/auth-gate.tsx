"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"

import { useMe } from "@/features/use-auth"
import { AdminSkeleton } from "@/components/layout/admin-skeleton"
import { PusherProvider } from "@/components/providers/pusher-provider"

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { data: user, isPending, isError } = useMe()
  const router = useRouter()
  const pathname = usePathname()

  const isAuthenticated = !isPending && !isError && !!user

  React.useEffect(() => {
    if (isPending) return
    if (!isAuthenticated) {
      router.replace(`/sign-in?from=${encodeURIComponent(pathname)}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isPending, pathname, router])

  if (isPending || !isAuthenticated) {
    return <AdminSkeleton />
  }

  return <PusherProvider userId={user.id}>{children}</PusherProvider>
}
