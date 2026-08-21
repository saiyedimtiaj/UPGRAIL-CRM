import { cn } from "@/lib/utils"

export type Status = "finalized" | "pending" | "voided" | "cleared" | "owed"

const STATUS_META: Record<Status, { label: string; className: string }> = {
  finalized: {
    label: "FINALIZED",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  pending: {
    label: "PENDING",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  voided: {
    label: "VOIDED",
    className: "bg-rose-50 text-rose-700 border-rose-200",
  },
  cleared: {
    label: "SETTLED",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
  owed: {
    label: "OWED",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
}

export function StatusBadge({
  status,
  className,
}: {
  status: Status
  className?: string
}) {
  const meta = STATUS_META[status]
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wide",
        meta.className,
        className
      )}
    >
      {meta.label}
    </span>
  )
}
