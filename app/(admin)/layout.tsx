import type { Metadata } from "next"

import { AuthGate } from "@/components/layout/auth-gate"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { PageTransition } from "@/components/layout/page-transition"

export const metadata: Metadata = {
  title: {
    template: "%s — AdFund Global",
    default: "AdFund Global",
  },
}

export default function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGate>
      <div className="flex min-h-screen w-full bg-brand-canvas">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="w-full flex-1">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
    </AuthGate>
  )
}
