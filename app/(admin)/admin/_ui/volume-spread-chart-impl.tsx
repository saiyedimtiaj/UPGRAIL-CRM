"use client"

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { TimeSeriesPoint, TimeSeriesRange } from "@/lib/types"
import { ChartTooltip } from "@/app/(admin)/admin/_ui/chart-tooltip"

export function VolumeSpreadChartImpl({
  points,
  range,
}: {
  points: TimeSeriesPoint[]
  range: TimeSeriesRange
}) {
  const hasData = points.some((p) => p.volumeUSD > 0)

  if (!hasData) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-center">
        <p className="text-sm font-semibold text-slate-500">
          No trades in this period
        </p>
        <p className="text-xs text-slate-400">
          {range === "weekly"
            ? "Log a trade to see the last 7 days here."
            : range === "monthly"
              ? "No activity in the last 30 days."
              : "No activity in the last 12 months."}
        </p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={points}
        margin={{ top: 24, right: 12, left: -12, bottom: 0 }}
      >
        <defs>
          <linearGradient id="volumeFill" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--chart-volume)"
              stopOpacity={0.32}
            />
            <stop offset="100%" stopColor="var(--chart-volume)" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid vertical={false} stroke="#eef2f0" strokeDasharray="4 4" />

        <XAxis
          dataKey="label"
          stroke="#94a3b8"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickMargin={10}

          interval={range === "monthly" ? 4 : 0}
        />

        <YAxis
          yAxisId="volume"
          stroke="#94a3b8"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) =>
            v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
          }
        />

        <YAxis
          yAxisId="spread"
          orientation="right"
          stroke="#94a3b8"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `${v.toFixed(1)}%`}
        />

        <Tooltip
          content={ChartTooltip}
          cursor={{
            stroke: "var(--chart-volume)",
            strokeWidth: 1,
            strokeDasharray: "3 3",
          }}
        />

        <Legend
          verticalAlign="top"
          align="right"
          height={28}
          iconType="plainline"
          wrapperStyle={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}
        />

        <Area
          yAxisId="volume"
          type="monotone"
          dataKey="volumeUSD"
          name="Volume (USD)"
          stroke="var(--chart-volume)"
          strokeWidth={2.5}
          fill="url(#volumeFill)"
          dot={false}
          activeDot={{
            r: 4,
            fill: "var(--chart-volume)",
            stroke: "#ffffff",
            strokeWidth: 2,
          }}
        />

        <Line
          yAxisId="spread"
          type="monotone"
          dataKey="spreadPercent"
          name="Spread %"
          stroke="var(--chart-line)"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          dot={false}
          activeDot={{ r: 3, fill: "var(--chart-line)" }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
