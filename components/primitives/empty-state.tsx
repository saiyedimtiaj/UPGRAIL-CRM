import * as React from "react"
import type { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-panel border border-dashed border-zinc-200 py-12 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-700">{title}</p>
        {description && (
          <p className="mt-0.5 max-w-xs text-xs text-slate-400">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}
