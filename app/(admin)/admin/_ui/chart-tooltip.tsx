import type { TooltipContentProps } from "recharts"
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent"

import type { TimeSeriesPoint } from "@/lib/types"
import { bdt, usd } from "@/lib/format"

export function ChartTooltip({
  active,
  payload,
}: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload || payload.length === 0) return null
  const p = payload[0].payload as TimeSeriesPoint

  return (
    <div className="rounded-xl border border-emerald-500/30 bg-brand-card p-3 font-mono text-xs text-white shadow-xl">
      <div className="mb-1.5 font-bold text-emerald-400">{p.label}</div>
      <div>Volume: {usd(p.volumeUSD)}</div>
      <div>Profit: {bdt(p.profitBDT)}</div>
      <div className="mt-1 border-t border-white/10 pt-1 text-emerald-300">
        Spread: {p.spreadPercent}%
      </div>
      <div className="text-[10px] text-zinc-400">
        {p.tradeCount} trade{p.tradeCount === 1 ? "" : "s"}
      </div>
    </div>
  )
}
