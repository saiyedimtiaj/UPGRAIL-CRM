"use client"

import dynamic from "next/dynamic"

import type { TimeSeriesPoint, TimeSeriesRange } from "@/lib/types"

// Recharts' ResponsiveContainer measures the DOM and produces nothing useful
// during SSR, so the real implementation is loaded client-only. Next.js 16
// only allows `ssr: false` inside a Client Component, hence this wrapper
// file carries "use client" and the actual chart lives in a separate module.
const VolumeSpreadChartImpl = dynamic(
  () =>
    import("@/app/(admin)/admin/_ui/volume-spread-chart-impl").then(
      (m) => m.VolumeSpreadChartImpl
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full animate-pulse rounded-xl bg-slate-100" />
    ),
  }
)

export function VolumeSpreadChart({
  points,
  range,
}: {
  points: TimeSeriesPoint[]
  range: TimeSeriesRange
}) {
  return (
    <div className="h-64 w-full">
      <VolumeSpreadChartImpl points={points} range={range} />
    </div>
  )
}
