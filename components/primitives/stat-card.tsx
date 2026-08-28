"use client"

import * as React from "react"
import { motion, useMotionValue, animate } from "motion/react"
import type { LucideIcon } from "lucide-react"
import { TrendingDown, TrendingUp } from "lucide-react"

import { cn } from "@/lib/utils"
import { countUpTransition } from "@/lib/animations"

interface StatCardProps {

  tone?: "dark" | "light" | "mint"
  icon?: LucideIcon
  label: string

  value: number

  format?: (n: number) => string
  delta?: { direction: "up" | "down"; label: string }
  sparkline?: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

function useCountUp(value: number) {
  const motionValue = useMotionValue(0)
  const [display, setDisplay] = React.useState(0)

  React.useEffect(() => {
    const controls = animate(motionValue, value, {
      ...countUpTransition,
      onUpdate: (v) => setDisplay(v),
    })
    return () => controls.stop()
    // motionValue is a stable handle from useMotionValue; listing it satisfies
    // the exhaustive-deps rule without changing when this re-runs.
  }, [value, motionValue])

  return display
}

const ICON_WRAP: Record<NonNullable<StatCardProps["tone"]>, string> = {
  dark: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25",
  light: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
  mint: "bg-white/70 text-emerald-800 ring-1 ring-emerald-900/10",
}

export function StatCard({
  tone = "light",
  icon: Icon,
  label,
  value,
  format = (n) => n.toLocaleString(),
  delta,
  sparkline,
  footer,
  className,
}: StatCardProps) {
  const animatedValue = useCountUp(value)

  return (
    <motion.div
      className={cn(
        "relative flex h-full flex-col justify-between overflow-hidden rounded-panel p-5",
        tone === "dark" &&
          "border border-white/10 bg-brand-card text-white shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset]",
        tone === "light" &&
          "border border-zinc-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        tone === "mint" &&
          "border border-emerald-900/10 bg-brand-mint text-slate-900",
        className
      )}
    >
      {/* Ambient corner glow — dark cards only, purely decorative depth. */}
      {tone === "dark" && (
        <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />
      )}

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          {Icon && (
            <div
              className={cn(
                "mb-3 flex h-9 w-9 items-center justify-center rounded-xl",
                ICON_WRAP[tone]
              )}
            >
              <Icon className="h-4.5 w-4.5" />
            </div>
          )}
          <span
            className={cn(
              "mb-1.5 block text-[11px] font-semibold tracking-wide uppercase",
              tone === "dark"
                ? "text-emerald-400/80"
                : tone === "mint"
                  ? "text-emerald-800/80"
                  : "text-slate-400"
            )}
          >
            {label}
          </span>
          <div
            className={cn(
              "text-[26px] leading-none font-black tracking-tight lg:text-[28px]",
              tone === "dark" ? "text-white" : "text-slate-900"
            )}
          >
            {format(animatedValue)}
          </div>
        </div>
        {sparkline && !Icon && <div className="shrink-0">{sparkline}</div>}
      </div>

      {(delta || footer) && (
        <div
          className={cn(
            "relative pt-4",
            tone === "mint"
              ? "space-y-2.5"
              : "flex items-center justify-between gap-2"
          )}
        >
          {delta && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold",
                delta.direction === "up"
                  ? tone === "dark"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-600"
              )}
            >
              {delta.direction === "up" ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {delta.label}
            </span>
          )}
          {footer}
        </div>
      )}
    </motion.div>
  )
}
