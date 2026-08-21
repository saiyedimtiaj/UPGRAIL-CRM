import { cn } from "@/lib/utils"
import type { AuditAction } from "@/lib/types"
import { AUDIT_ACTION_META } from "@/lib/calc/audit"

export function ActionBadge({
  action,
  className,
}: {
  action: AuditAction
  className?: string
}) {
  const meta = AUDIT_ACTION_META[action]
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
