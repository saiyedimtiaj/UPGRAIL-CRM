"use client"

import Link from "next/link"
import { CheckCircle2, Clock, FileText, RefreshCw, XCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import type { TransactionStats } from "@/services/transactions.api"
import { Skeleton } from "@/components/ui/skeleton"

const CARDS = [
  { key: "total", label: "Total Transactions", icon: FileText, tone: "text-slate-600 bg-slate-100", href: "/admin/transactions" },
  { key: "finalized", label: "Finalized", icon: CheckCircle2, tone: "text-emerald-700 bg-emerald-50", href: "/admin/transactions?status=FINALIZED" },
  { key: "awaiting_settlement", label: "Awaiting Settlement", icon: Clock, tone: "text-amber-700 bg-amber-50", href: "/admin/transactions?status=PENDING_UNSETTLED" },
  { key: "partial_settlement", label: "Partial Settlement", icon: RefreshCw, tone: "text-sky-700 bg-sky-50", href: "/admin/transactions?status=PENDING_PARTIAL" },
  { key: "cancelled", label: "Cancelled", icon: XCircle, tone: "text-rose-700 bg-rose-50", href: "/admin/transactions?status=VOIDED" },
] as const

export function TransactionStatsRow({
  stats,
  isLoading,
}: {
  stats?: TransactionStats
  isLoading?: boolean
}) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      {CARDS.map(({ key, label, icon: Icon, tone, href }) => {
        const value = stats[key]
        // "Total" has no percentage of itself to show.
        const pct =
          key === "total"
            ? null
            : stats[`${key}_percent` as keyof TransactionStats]

        return (
          <div
            key={key}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4"
          >
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl",
                  tone
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                {label}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold tracking-tight tabular-nums text-slate-900">
                {value.toLocaleString()}
              </span>
              {pct !== null && (
                <span className="text-xs font-medium text-slate-400">
                  ({pct}%)
                </span>
              )}
            </div>

            <Link
              href={href}
              className="text-[11px] font-semibold text-sky-700 hover:underline"
            >
              View all →
            </Link>
          </div>
        )
      })}
    </div>
  )
}
