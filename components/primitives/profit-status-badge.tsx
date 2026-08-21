import { cn } from "@/lib/utils"
import type { ProfitStatus } from "@/lib/types"

/** Spec §6.5: the seller/cost side of a transaction has five states, richer
 *  than the old binary pending/finalized — a trade can be fully priced on
 *  the client side while still waiting on Nazmul to settle the seller. */
const PROFIT_STATUS_META: Record<ProfitStatus, { label: string; className: string }> = {
  AWAITING_DAILY_RATE: {
    label: "AWAITING DAILY RATE",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  PENDING_UNSETTLED: {
    label: "PENDING — UNSETTLED",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  PENDING_PARTIAL: {
    label: "PENDING — PARTIAL",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  FINALIZED: {
    label: "FINALIZED",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  VOIDED: {
    label: "VOIDED",
    className: "bg-rose-50 text-rose-700 border-rose-200",
  },
}

export function ProfitStatusBadge({
  status,
  className,
}: {
  status: ProfitStatus
  className?: string
}) {
  const meta = PROFIT_STATUS_META[status]
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wide whitespace-nowrap",
        meta.className,
        className
      )}
    >
      {meta.label}
    </span>
  )
}
