import type { Metadata } from "next"

import { getCurrentUserOrRedirect } from "@/lib/getCurrentUser"
import { AuthHydration } from "@/components/providers/auth-hydration"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { PageTransition } from "@/components/layout/page-transition"

export const metadata: Metadata = {
  title: {
    template: "%s — AdFund Global",
    default: "AdFund Global",
  },
}

export default async function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUserOrRedirect()

  return (
    <AuthHydration user={user}>
      <div className="flex min-h-screen w-full bg-brand-canvas">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="w-full flex-1">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
    </AuthHydration>
  )
}
