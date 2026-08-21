import * as React from "react"
import { cn } from "@/lib/utils"

interface SectionCardProps extends Omit<React.ComponentProps<"div">, "title"> {

  variant?: "light" | "dark"
  title?: React.ReactNode
  subtitle?: React.ReactNode
  action?: React.ReactNode
}

export function SectionCard({
  variant = "light",
  title,
  subtitle,
  action,
  className,
  children,
  ...props
}: SectionCardProps) {
  return (
    <div
      className={cn(
        "h-full rounded-card p-4 sm:p-6",
        variant === "light" && "border border-zinc-200/90 bg-white shadow-sm",
        variant === "dark" &&
          "border border-emerald-500/20 bg-brand-card text-white shadow-xl",
        className
      )}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 sm:mb-5 sm:flex-nowrap sm:gap-4">
          <div className="min-w-0">
            {title && (
              <h2
                className={cn(
                  "truncate text-sm font-extrabold tracking-tight sm:text-base",
                  variant === "dark" ? "text-white" : "text-slate-900"
                )}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                className={cn(
                  "truncate text-xs font-medium",
                  variant === "dark" ? "text-zinc-400" : "text-slate-500"
                )}
              >
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
