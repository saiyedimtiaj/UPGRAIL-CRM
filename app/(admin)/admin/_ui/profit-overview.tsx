"use client"

import Link from "next/link"
import { Clock, TrendingUp, Wallet } from "lucide-react"

import { useMetrics } from "@/features/use-analytics"
import { bdt } from "@/lib/format"
import { Skeleton } from "@/components/ui/skeleton"

export function ProfitOverview() {
  const { data: metrics, isPending } = useMetrics()

  if (isPending || !metrics) {
    return <Skeleton className="h-40 w-full rounded-2xl" />
  }

  const items = [
    {
      label: "Earned Profit",
      value: metrics.totalEarnedProfit,
      icon: TrendingUp,
      tone: "text-emerald-700",
      hint: "Finalized trades only",
    },
    {
      label: "Profit Taken Out",
      value: metrics.profitTakenOut,
      icon: Wallet,
      tone: "text-slate-700",
      hint: "Reached Profit Bank",
    },
    {
      label: "Profit Remaining",
      value: metrics.profitRemaining,
      icon: Clock,
      tone: "text-amber-700",
      hint: "Earned, not yet taken out",
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {items.map(({ label, value, icon: Icon, tone, hint }) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-4"
          >
            <div className="flex items-center gap-2 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
              <Icon className={`h-3.5 w-3.5 ${tone}`} />
              {label}
            </div>
            <div className="mt-2 font-mono text-xl font-bold tracking-tight tabular-nums text-slate-900">
              {bdt(value)}
            </div>
            <div className="mt-0.5 text-[11px] text-slate-400">{hint}</div>
          </div>
        ))}
      </div>

      {metrics.profitPendingCount > 0 && (
        <Link
          href="/admin/transactions?status=PENDING_UNSETTLED"
          className="flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 transition-colors hover:bg-amber-100"
        >
          <Clock className="h-4 w-4 shrink-0" />
          <span className="flex-1">
            <strong className="font-semibold">
              {metrics.profitPendingCount} transaction
              {metrics.profitPendingCount === 1 ? "" : "s"}
            </strong>{" "}
            waiting on settlement before their profit can finalize
          </span>
          <span className="text-xs font-semibold">View →</span>
        </Link>
      )}
    </div>
  )
}
