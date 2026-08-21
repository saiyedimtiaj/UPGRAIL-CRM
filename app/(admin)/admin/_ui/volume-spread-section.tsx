"use client"

import * as React from "react"

import type { TimeSeriesRange } from "@/lib/types"
import { useTimeSeries } from "@/features/use-analytics"
import { SectionCard } from "@/components/primitives/section-card"
import { Alert } from "@/components/shared/alert"
import { VolumeSpreadChart } from "@/app/(admin)/admin/_ui/volume-spread-chart"
import { ChartRangeSelect } from "@/app/(admin)/admin/_ui/chart-range-select"

const SUBTITLE: Record<TimeSeriesRange, string> = {
  weekly: "Daily USD throughput & realized BDT spread — last 7 days",
  monthly: "Daily USD throughput & realized BDT spread — last 30 days",
  yearly: "Monthly USD throughput & realized BDT spread — last 12 months",
}

export function VolumeSpreadSection() {
  const [range, setRange] = React.useState<TimeSeriesRange>("weekly")
  const { data, isPending, isError } = useTimeSeries(range)

  return (
    <SectionCard
      title="Sourcing Volume & Spread Index"
      subtitle={SUBTITLE[range]}
      action={<ChartRangeSelect value={range} onChange={setRange} />}
    >
      {isError ? (
        <Alert
          variant="error"
          message="Couldn't load the chart data. Refresh the page to try again."
        />
      ) : isPending ? (
        <div className="h-64 w-full animate-pulse rounded-xl bg-slate-100" />
      ) : (
        <VolumeSpreadChart points={data?.points ?? []} range={range} />
      )}
    </SectionCard>
  )
}
