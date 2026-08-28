"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { useMe } from "@/features/use-auth"
import { AuthBrandPanel } from "@/app/(auth)/_components/auth-brand-panel"

export default function AuthGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: user, isPending, isError } = useMe()
  const router = useRouter()
  const isAuthenticated = !isPending && !isError && !!user

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace("/admin")
    }
  }, [isAuthenticated, router])

  return (
    <div className="flex min-h-dvh w-full flex-col overflow-x-hidden bg-white lg:flex-row">
      <AuthBrandPanel />

      {}
      <main className="flex w-full flex-1 items-start justify-center px-5 pt-10 pb-12 sm:px-8 lg:items-center lg:px-12 lg:py-12">
        <div className="w-full max-w-[26rem] pb-[env(safe-area-inset-bottom)]">
          {children}
        </div>
      </main>
    </div>
  )
}
