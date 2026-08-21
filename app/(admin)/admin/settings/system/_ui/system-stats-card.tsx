"use client"

import { Database } from "lucide-react"

import { useAdminStats } from "@/features/use-admin"
import { SectionCard } from "@/components/primitives/section-card"
import { Skeleton } from "@/components/ui/skeleton"


export function SystemStatsCard() {
  const { data: stats, isPending } = useAdminStats()

  const counts = stats
    ? [
        { label: "Transactions", value: stats.transactions },
        { label: "Clients", value: stats.clients },
        { label: "Sellers", value: stats.sellers },
        { label: "Settlements", value: stats.settlements },
        { label: "Payments", value: stats.payments },
        { label: "Withdrawals", value: stats.withdrawals },
        { label: "Audit Entries", value: stats.auditLogs },
        { label: "Users", value: stats.users },
      ]
    : []

  return (
    <SectionCard
      title="System Data"
      subtitle="Row counts across every entity in the database"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {isPending
          ? Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))
          : counts.map((c) => (
              <div key={c.label} className="rounded-xl bg-slate-50 px-3 py-2.5">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                  <Database className="h-3 w-3" />
                  {c.label}
                </div>
                <div className="mt-0.5 font-mono text-lg font-black text-slate-900">
                  {c.value}
                </div>
              </div>
            ))}
      </div>
    </SectionCard>
  )
}
