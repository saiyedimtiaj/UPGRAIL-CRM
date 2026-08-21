"use client"

import type { TimeSeriesRange } from "@/lib/types"
import { SelectField } from "@/components/primitives/select-field"

const RANGES: { value: TimeSeriesRange; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
]

export function ChartRangeSelect({
  value,
  onChange,
}: {
  value: TimeSeriesRange
  onChange: (range: TimeSeriesRange) => void
}) {
  return (
    <SelectField
      variant="pill-dark"
      value={value}
      onChange={(v) => onChange(v as TimeSeriesRange)}
      options={RANGES}
    />
  )
}
