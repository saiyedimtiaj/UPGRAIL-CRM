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
    // dvh (not vh) so mobile browser chrome doesn't crop the form.
    // overflow-x-hidden guards against the blurred decorative circles in the
    // brand panel widening the page on narrow screens.
    <div className="flex min-h-dvh w-full flex-col overflow-x-hidden bg-white lg:flex-row">
      <AuthBrandPanel />

      {/* On mobile the form starts near the banner (items-start) rather than
          centring in the leftover height, which stranded it mid-screen with a
          large gap. Centred from lg up, where the panel is side-by-side. */}
      <main className="flex w-full flex-1 items-start justify-center px-5 pt-10 pb-12 sm:px-8 lg:items-center lg:px-12 lg:py-12">
        <div className="w-full max-w-[26rem] pb-[env(safe-area-inset-bottom)]">
          {children}
        </div>
      </main>
    </div>
  )
}
