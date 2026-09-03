"use client"

import { AlertTriangle, CheckCircle2, Users, Wallet } from "lucide-react"

import { cn } from "@/lib/utils"
import { bdt } from "@/lib/format"
import { useClientsOverdue } from "@/features/use-analytics"
import { Skeleton } from "@/components/ui/skeleton"

export function ClientsStats() {
  const { data, isPending } = useClientsOverdue()

  if (isPending || !data) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-2xl" />
        ))}
      </div>
    )
  }

  const { totals } = data

  const cards = [
    {
      label: "Overall Overdue",
      value: bdt(totals.total_overdue),
      icon: AlertTriangle,
      tone: "bg-rose-50 text-rose-700",
      hint:
        totals.total_overdue > 0
          ? "Unpaid for more than 48 hours"
          : "Nothing past the 48-hour mark",
      emphasise: totals.total_overdue > 0,
    },
    {
      label: "Total Paid",
      value: bdt(totals.total_paid),
      icon: CheckCircle2,
      tone: "bg-emerald-50 text-emerald-700",
      hint: "Collected from clients to date",
    },
    {
      label: "Client Total Due",
      value: bdt(totals.total_due),
      icon: Wallet,
      tone: "bg-amber-50 text-amber-700",
      hint: "Outstanding across all clients",
    },
    {
      label: "Total Clients",
      value: totals.total_clients.toLocaleString(),
      icon: Users,
      tone: "bg-slate-100 text-slate-700",
      hint: "Active and inactive",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, tone, hint, emphasise }) => (
        <div
          key={label}
          className={cn(
            "rounded-2xl border bg-white p-4",
            emphasise ? "border-rose-200" : "border-slate-200"
          )}
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
          <div
            className={cn(
              "mt-2 font-mono text-xl font-bold tracking-tight tabular-nums",
              emphasise ? "text-rose-700" : "text-slate-900"
            )}
          >
            {value}
          </div>
          <div className="mt-0.5 text-[11px] text-slate-400">{hint}</div>
        </div>
      ))}
    </div>
  )
}
