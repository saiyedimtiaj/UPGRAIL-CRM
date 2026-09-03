"use client"

import * as React from "react"
import { motion, useMotionValue, animate } from "motion/react"
import type { LucideIcon } from "lucide-react"
import { TrendingDown, TrendingUp } from "lucide-react"

import { cn } from "@/lib/utils"
import { countUpTransition } from "@/lib/animations"

/**
 * Each accent is tied to a money concept rather than to a card position, so
 * the same hue always means the same thing across the app: amber is money
 * clients owe us, emerald is profit we have earned, sky is what we owe out,
 * violet is seller USDT, teal is the reserve and rose is trouble.
 */
export type StatAccent =
  | "amber"
  | "emerald"
  | "sky"
  | "violet"
  | "teal"
  | "rose"
  | "slate"

interface StatCardProps {
  tone?: "dark" | "light" | "mint"
  /** Ignored on the dark and mint tones, which carry their own palette. */
  accent?: StatAccent
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
  }, [value, motionValue])

  return display
}

const ICON_WRAP: Record<NonNullable<StatCardProps["tone"]>, string> = {
  dark: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25",
  light: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
  mint: "bg-white/70 text-emerald-800 ring-1 ring-emerald-900/10",
}

// Written out in full because Tailwind only keeps classes it can see as
// complete strings — building them from the accent name would strip them.
const ACCENT_ICON: Record<StatAccent, string> = {
  amber: "bg-amber-50 text-amber-600 ring-1 ring-amber-100",
  emerald: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
  sky: "bg-sky-50 text-sky-600 ring-1 ring-sky-100",
  violet: "bg-violet-50 text-violet-600 ring-1 ring-violet-100",
  teal: "bg-teal-50 text-teal-600 ring-1 ring-teal-100",
  rose: "bg-rose-50 text-rose-600 ring-1 ring-rose-100",
  slate: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
}

const ACCENT_LABEL: Record<StatAccent, string> = {
  amber: "text-amber-700/80",
  emerald: "text-emerald-700/80",
  sky: "text-sky-700/80",
  violet: "text-violet-700/80",
  teal: "text-teal-700/80",
  rose: "text-rose-700/80",
  slate: "text-slate-400",
}

/** A tinted top edge, so a wall of cards reads as distinct at a glance. */
const ACCENT_EDGE: Record<StatAccent, string> = {
  amber: "before:bg-amber-400",
  emerald: "before:bg-emerald-400",
  sky: "before:bg-sky-400",
  violet: "before:bg-violet-400",
  teal: "before:bg-teal-400",
  rose: "before:bg-rose-400",
  slate: "before:bg-slate-300",
}

const ACCENT_SURFACE: Record<StatAccent, string> = {
  amber: "border-amber-200/70 bg-amber-50/30",
  emerald: "border-emerald-200/70 bg-emerald-50/30",
  sky: "border-sky-200/70 bg-sky-50/30",
  violet: "border-violet-200/70 bg-violet-50/30",
  teal: "border-teal-200/70 bg-teal-50/30",
  rose: "border-rose-200/70 bg-rose-50/30",
  slate: "border-zinc-200/80 bg-white",
}

export function StatCard({
  tone = "light",
  accent,
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
  // Only the light tone is accented; dark and mint already have a look.
  const activeAccent = tone === "light" ? accent : undefined

  return (
    <motion.div
      className={cn(
        "relative flex h-full flex-col justify-between overflow-hidden rounded-panel p-5",
        tone === "dark" &&
          "border border-white/10 bg-brand-card text-white shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset]",
        tone === "light" &&
          "border shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        tone === "light" &&
          (activeAccent
            ? ACCENT_SURFACE[activeAccent]
            : "border-zinc-200/80 bg-white"),
        activeAccent &&
          cn(
            "before:absolute before:inset-x-0 before:top-0 before:h-1 before:content-['']",
            ACCENT_EDGE[activeAccent]
          ),
        tone === "mint" &&
          "border border-emerald-900/10 bg-brand-mint text-slate-900",
        className
      )}
    >
      {}
      {tone === "dark" && (
        <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />
      )}

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          {Icon && (
            <div
              className={cn(
                "mb-3 flex h-9 w-9 items-center justify-center rounded-xl",
                activeAccent ? ACCENT_ICON[activeAccent] : ICON_WRAP[tone]
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
                  : activeAccent
                    ? ACCENT_LABEL[activeAccent]
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
