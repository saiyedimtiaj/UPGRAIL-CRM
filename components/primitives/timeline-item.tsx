import * as React from "react"
import { cn } from "@/lib/utils"
import { BdtSigned } from "@/components/primitives/money"
import { StatusBadge, type Status } from "@/components/primitives/status-badge"

interface TimelineItemProps {
  icon: React.ReactNode
  iconTone?: "blue" | "emerald" | "rose" | "amber"
  title: string
  subtitle: string
  amount: number
  direction: "in" | "out"
  status?: Status
  /** Optional row-actions slot (e.g. shared/RowActions) — used on the
   *  Client/Seller ledger timelines so a payment can be edited or removed
   *  without leaving the party's statement view. */
  actions?: React.ReactNode
}

const ICON_TONE_CLASSES: Record<
  NonNullable<TimelineItemProps["iconTone"]>,
  string
> = {
  blue: "bg-blue-50 text-blue-600",
  emerald: "bg-emerald-50 text-emerald-600",
  rose: "bg-rose-50 text-rose-600",
  amber: "bg-amber-50 text-amber-600",
}

/** One row of the merged trade/payment timeline shown on the Client and
 *  Seller ledger detail panes. */
export function TimelineItem({
  icon,
  iconTone = "blue",
  title,
  subtitle,
  amount,
  direction,
  status,
  actions,
}: TimelineItemProps) {
  const signedAmount = direction === "in" ? amount : -amount

  return (
    <div className="group flex items-center gap-3 py-2.5">
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          ICON_TONE_CLASSES[iconTone]
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold text-slate-900">{title}</div>
        <div className="truncate text-[11px] font-medium text-slate-500">
          {subtitle}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <BdtSigned value={signedAmount} className="block text-sm font-bold" />
        {status && <StatusBadge status={status} className="mt-0.5" />}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  )
}
