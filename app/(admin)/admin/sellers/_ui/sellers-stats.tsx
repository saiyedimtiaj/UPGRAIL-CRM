"use client"

import { Building2, Coins, HandCoins } from "lucide-react"

import { cn } from "@/lib/utils"
import { useBalances } from "@/features/use-analytics"
import { useActiveSellers } from "@/features/use-sellers"
import { Skeleton } from "@/components/ui/skeleton"

export function SellersStats() {
  const { data: balances, isPending: balancesPending } = useBalances()
  const { data: sellers = [], isPending: sellersPending } = useActiveSellers()

  if (balancesPending || sellersPending) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-2xl" />
        ))}
      </div>
    )
  }

  // The conduit is reported separately in BDT, so it is excluded here to keep
  // this a pure USDT view of the external sellers.
  const external = sellers.filter((s) => !s.isSettlementConduit)
  const dues = balances?.sellerUsdtDues ?? {}
  const advances = balances?.sellerAdvances ?? {}

  // A negative due means the seller is holding our credit, which is what an
  // advance is — count those separately rather than letting them net away.
  const totalDue = external.reduce(
    (sum, s) => sum + Math.max(0, dues[s.id] ?? 0),
    0
  )
  const totalAdvance = external.reduce(
    (sum, s) => sum + (advances[s.id] ?? 0),
    0
  )

  const cards = [
    {
      label: "Total Sellers",
      value: external.length.toLocaleString(),
      icon: Building2,
      tone: "bg-slate-100 text-slate-700",
      hint: "External sourcing desks",
    },
    {
      label: "Total Due",
      value: `${totalDue.toLocaleString()} USDT`,
      icon: Coins,
      tone: "bg-amber-50 text-amber-700",
      hint: "Owed across all external sellers",
    },
    {
      label: "Total Advance",
      value: `${totalAdvance.toLocaleString()} USDT`,
      icon: HandCoins,
      tone: "bg-sky-50 text-sky-700",
      hint: "Paid ahead, credited to future trades",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map(({ label, value, icon: Icon, tone, hint }) => (
        <div
          key={label}
          className="rounded-2xl border border-slate-200 bg-white p-4"
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
          <div className="mt-2 font-mono text-xl font-bold tracking-tight tabular-nums text-slate-900">
            {value}
          </div>
          <div className="mt-0.5 text-[11px] text-slate-400">{hint}</div>
        </div>
      ))}
    </div>
  )
}
