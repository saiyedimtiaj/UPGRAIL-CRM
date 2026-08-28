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

/**
 * Authentication is resolved here, on the server, before any markup is sent.
 *
 * The previous client-side <AuthGate> returned null until `useMe()` settled,
 * so every cold load was: blank page → download JS → hydrate → fetch /auth/me
 * → wait → finally render the shell. Doing it here means the sidebar and
 * topbar are in the first byte of HTML, and the resolved user is handed to
 * the client cache so nothing refetches it.
 */
export default async function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUserOrRedirect()

  return (
    <AuthHydration user={user}>
      <div className="bg-brand-canvas flex min-h-screen w-full">
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
