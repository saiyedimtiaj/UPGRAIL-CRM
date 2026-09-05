"use client"

import { usePathname, useRouter } from "next/navigation"
import { Zap } from "lucide-react"

import { resolvePageMeta } from "@/lib/nav"
import { useMetrics } from "@/features/use-analytics"
import { Button } from "@/components/ui/button"
import { MobileSidebar } from "@/components/layout/mobile-sidebar"
import { usePermissions } from "@/hooks/use-permission"

export function Topbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: metrics } = useMetrics()
  const { can } = usePermissions()
  const meta = resolvePageMeta(pathname)

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-zinc-200/70 bg-white/80 px-4 py-3 backdrop-blur-md sm:gap-4 sm:px-6 sm:py-4">
      <div className="flex min-w-0 items-center gap-2">
        <MobileSidebar />
        <div className="min-w-0">
          <h1 className="truncate text-lg font-extrabold tracking-tight text-slate-900 md:text-base">
            {meta.title}
          </h1>
          <p className="hidden truncate text-xs font-medium text-slate-500 sm:block">
            {meta.subtitle}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        {can("rates.view") &&
          !!metrics?.profitPendingCount &&
          metrics.profitPendingCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="hidden border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 lg:inline-flex"
            onClick={() => router.push("/admin/rates")}
          >
            {metrics.profitPendingCount} Pending Rates
          </Button>
        )}

        {/* Hidden for a role that cannot create a trade — offering a button
            that leads to a page they may not open is worse than no button. */}
        {can("trades.create") && (
          <Button
            onClick={() => router.push("/admin/trades")}
            size="sm"
            className="gap-1.5 sm:h-10 sm:px-4 sm:text-sm"
          >
            <Zap className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Log Trade</span>
          </Button>
        )}
      </div>
    </header>
  )
}
