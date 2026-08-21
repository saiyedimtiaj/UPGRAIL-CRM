import { BarChart3, TrendingUp, Wallet } from "lucide-react"

import { StatCard } from "@/components/primitives/stat-card"
import { bdt, usd } from "@/lib/format"
import type { Transaction } from "@/lib/types"


export function ReportSummary({ trades }: { trades: Transaction[] }) {
  const totalVolumeUSD = trades.reduce((sum, t) => sum + t.usd_amount, 0)
  const totalProfit = trades
    .filter((t) => t.profit_status === "FINALIZED" && !t.voided)
    .reduce((sum, t) => sum + (t.profit ?? 0), 0)
  const avgTradeUSD = trades.length > 0 ? totalVolumeUSD / trades.length : 0

  return (
    <div className="grid h-full grid-cols-1 gap-5 sm:grid-cols-3">
      <StatCard
        tone="light"
        icon={BarChart3}
        label="Total Filtered Volume"
        value={totalVolumeUSD}
        format={(n) => `${usd(n)} USD`}
      />
      <StatCard
        tone="light"
        icon={TrendingUp}
        label="Filtered Realized Profit"
        value={totalProfit}
        format={(n) => bdt(n)}
      />
      <StatCard
        tone="light"
        icon={Wallet}
        label="Average Trade Size"
        value={avgTradeUSD}
        format={(n) => `${usd(n)} USD`}
        footer={
          <span className="text-[11px] font-semibold text-slate-400">
            {trades.length} trade{trades.length === 1 ? "" : "s"} matched
          </span>
        }
      />
    </div>
  )
}
