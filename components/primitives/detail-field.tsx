import * as React from "react"
import { cn } from "@/lib/utils"

// The label-over-value micro-pattern already inlined once on the ledger
// panes (e.g. "Running Net Balance" above a BalancePill) — extracted so a
// third hand-rolled copy doesn't appear on the detail pages.
export function DetailField({
  label,
  value,
  mono,
  className,
}: {
  label: string
  value: React.ReactNode
  mono?: boolean
  className?: string
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
        {label}
      </div>
      <div
        className={cn(
          "mt-0.5 truncate text-sm font-semibold text-slate-800",
          mono && "font-mono"
        )}
      >
        {value}
      </div>
    </div>
  )
}
