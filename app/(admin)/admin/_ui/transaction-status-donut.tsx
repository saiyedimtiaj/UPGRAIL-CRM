"use client"

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"

import type { TransactionStats } from "@/services/transactions.api"
import { Skeleton } from "@/components/ui/skeleton"

const SLICES = [
  { key: "finalized", label: "Finalized", color: "#059669" },
  { key: "awaiting_settlement", label: "Awaiting Settlement", color: "#d97706" },
  { key: "partial_settlement", label: "Partial Settlement", color: "#0284c7" },
  { key: "awaiting_rate", label: "Needs Attention", color: "#e11d48" },
  { key: "cancelled", label: "Cancelled", color: "#94a3b8" },
] as const

export function TransactionStatusDonut({
  stats,
  isLoading,
}: {
  stats?: TransactionStats
  isLoading?: boolean
}) {
  if (isLoading || !stats) {
    return <Skeleton className="h-64 w-full rounded-2xl" />
  }

  const data = SLICES.map((s) => ({
    name: s.label,
    value: stats[s.key],
    color: s.color,
    percent: stats[`${s.key}_percent` as keyof TransactionStats],
  })).filter((d) => d.value > 0)

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="relative h-44 w-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.length ? data : [{ name: "None", value: 1, color: "#e2e8f0" }]}
              dataKey="value"
              innerRadius={54}
              outerRadius={78}
              paddingAngle={2}
              stroke="none"
              isAnimationActive={false}
            >
              {(data.length ? data : [{ color: "#e2e8f0" }]).map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Centre label sits above the chart rather than inside it, so it
            never re-flows when a slice is added or removed. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-2xl font-bold tabular-nums text-slate-900">
            {stats.total.toLocaleString()}
          </span>
          <span className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
            Total
          </span>
        </div>
      </div>

      <ul className="flex-1 space-y-2.5">
        {SLICES.map((s) => (
          <li key={s.key} className="flex items-center gap-2.5 text-xs">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="flex-1 text-slate-600">{s.label}</span>
            <span className="font-mono font-semibold tabular-nums text-slate-900">
              {stats[s.key].toLocaleString()}
            </span>
            <span className="w-12 text-right text-slate-400 tabular-nums">
              ({stats[`${s.key}_percent` as keyof TransactionStats]}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
