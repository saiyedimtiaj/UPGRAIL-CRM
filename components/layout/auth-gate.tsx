"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { isAxiosError } from "axios"

import { useMe } from "@/features/use-auth"

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { data: user, error, isPending } = useMe()
  const router = useRouter()
  const pathname = usePathname()

  const isAuthenticated = !isPending && !error && !!user
  const isUnauthorized =
    isAxiosError(error) &&
    (error.response?.status === 401 || error.response?.status === 403)

  React.useEffect(() => {
    if (isPending) return
    if (isUnauthorized) {
      router.replace(`/sign-in?from=${encodeURIComponent(pathname)}`)
    }

  }, [isPending, isUnauthorized, pathname, router])

  if (isPending || isUnauthorized) return null

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <p className="text-sm text-slate-600">
          We could not verify your session. Please refresh and try again.
        </p>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return <>{children}</>
}
