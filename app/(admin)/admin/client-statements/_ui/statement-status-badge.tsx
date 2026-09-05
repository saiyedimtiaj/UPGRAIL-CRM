import { cn } from "@/lib/utils"
import type { StatementRow } from "@/services/statements.api"

/**
 * Where a client's statement stands for the chosen day.
 *
 * Its own component rather than a StatusBadge variant, matching how
 * ProfitStatusBadge and ActivePill each own their vocabulary. Colour is used
 * semantically only — emerald for delivered, amber for waiting, rose for a
 * real failure — per the app's monochrome brand rule.
 */
export function StatementStatusBadge({ row }: { row: StatementRow }) {
  const { label, className } = describe(row)

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wide",
        className,
      )}
    >
      {label}
    </span>
  )
}

function describe(row: StatementRow): { label: string; className: string } {
  if (row.statement?.status === "SENT") {
    return {
      label: "SENT",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    }
  }

  if (row.statement?.status === "FAILED") {
    return {
      label: "FAILED",
      className: "bg-rose-50 text-rose-700 border-rose-200",
    }
  }

  // Not connected is the commonest reason a statement cannot go out, and it
  // needs a different fix from a failure — so it reads differently.
  if (!row.telegram.connected) {
    return {
      label: "NOT CONNECTED",
      className: "bg-slate-100 text-slate-600 border-slate-200",
    }
  }

  return {
    label: "NOT SENT",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  }
}
