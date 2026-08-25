"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"

import { useMe } from "@/features/use-auth"

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

  }, [isAuthenticated, isPending, pathname, router])

  return <>{children}</>
}
