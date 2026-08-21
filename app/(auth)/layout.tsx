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
    <div className="flex min-h-screen w-full items-stretch overflow-hidden bg-[#06140d] font-sans text-slate-900">
      <AuthBrandPanel />
      <div className="flex w-full items-center justify-center overflow-y-auto bg-white px-6 py-10 lg:w-1/2">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
