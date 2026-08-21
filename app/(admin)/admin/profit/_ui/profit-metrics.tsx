"use client"

import { useMetrics } from "@/features/use-analytics"
import { StatCard } from "@/components/primitives/stat-card"
import { bdt } from "@/lib/format"

export function ProfitMetrics() {
  const { data: metrics } = useMetrics()

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
      <StatCard
        tone="dark"
        label="Total Earned Profit"
        value={metrics?.totalEarnedProfit ?? 0}
        format={(n) => bdt(n)}
        delta={{
          direction: "up",
          label: "Finalized trades only",
        }}
      />
      <StatCard
        tone="light"
        label="Profit Taken Out"
        value={metrics?.profitTakenOut ?? 0}
        format={(n) => bdt(n)}
      />
      <StatCard
        tone="light"
        label="Profit Remaining"
        value={metrics?.profitRemaining ?? 0}
        format={(n) => bdt(n)}
      />
      <StatCard
        tone="light"
        label="Profit Pending"
        value={metrics?.profitPendingClientSalesValue ?? 0}
        format={(n) => bdt(n)}
        footer={
          <span className="text-[11px] font-semibold text-slate-500">
            {metrics?.profitPendingCount ?? 0} trade(s) awaiting settlement
          </span>
        }
      />
    </div>
  )
}
