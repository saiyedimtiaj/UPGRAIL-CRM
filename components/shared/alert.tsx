import * as React from "react"
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react"

import { cn } from "@/lib/utils"

export interface AlertProps {
  variant: "info" | "success" | "warning" | "error"
  title?: string
  message: string
  dismissible?: boolean
  onDismiss?: () => void
  action?: { label: string; onClick: () => void }
  icon?: boolean
  className?: string
}

const VARIANT_STYLES: Record<
  AlertProps["variant"],
  { bg: string; icon: React.ReactNode }
> = {
  info: {
    bg: "border-blue-500 bg-blue-50/70 text-blue-900",
    icon: <Info className="h-5 w-5 shrink-0 text-blue-500" />,
  },
  success: {
    bg: "border-emerald-500 bg-emerald-50/70 text-emerald-900",
    icon: <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />,
  },
  warning: {
    bg: "border-amber-500 bg-amber-50/70 text-amber-900",
    icon: <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />,
  },
  error: {
    bg: "border-rose-500 bg-rose-50/70 text-rose-900",
    icon: <XCircle className="h-5 w-5 shrink-0 text-rose-500" />,
  },
}

export function Alert({
  variant,
  title,
  message,
  dismissible = false,
  onDismiss,
  action,
  icon = true,
  className,
}: AlertProps) {
  const styles = VARIANT_STYLES[variant]

  return (
    <div
      className={cn(
        "relative flex w-full items-start gap-3 rounded-r-lg border-l-4 p-4 text-sm shadow-sm transition-all",
        styles.bg,
        className
      )}
    >
      {icon && styles.icon}
      <div className="flex-1 space-y-1">
        {title && (
          <h5 className="leading-none font-semibold tracking-tight">
            {title}
          </h5>
        )}
        <p className="leading-relaxed opacity-90">{message}</p>
        {action && (
          <div className="pt-2">
            <button
              type="button"
              onClick={action.onClick}
              className="cursor-pointer text-xs font-semibold underline underline-offset-2 opacity-90 hover:opacity-100"
            >
              {action.label}
            </button>
          </div>
        )}
      </div>
      {dismissible && (
        <button
          type="button"
          onClick={onDismiss}
          className="cursor-pointer rounded-md p-1 opacity-60 transition-opacity hover:opacity-100 focus:ring-1 focus:ring-current focus:outline-none"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
