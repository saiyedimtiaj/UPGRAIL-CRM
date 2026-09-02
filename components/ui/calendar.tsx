"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { todayISO } from "@/lib/date"

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

/**
 * Dates are handled as `YYYY-MM-DD` strings throughout, never as Date objects
 * crossing a timezone. The API stores day-strings, so converting to UTC and
 * back is the classic way to land a day early or late — this avoids it
 * entirely by doing the arithmetic on local-time parts.
 */
function parseISO(iso: string): { y: number; m: number; d: number } | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null
  const [y, m, d] = iso.split("-").map(Number)
  return { y, m: m - 1, d }
}

function toISO(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}

function daysInMonth(y: number, m: number): number {
  return new Date(y, m + 1, 0).getDate()
}

export interface CalendarProps {
  /** Selected day as `YYYY-MM-DD`, or null when nothing is chosen. */
  value?: string | null
  onSelect?: (iso: string) => void
  /** Inclusive bounds, also `YYYY-MM-DD`. */
  min?: string
  max?: string
  className?: string
}

export function Calendar({
  value,
  onSelect,
  min,
  max,
  className,
}: CalendarProps) {
  const today = todayISO()
  const selected = value ? parseISO(value) : null
  const initial = selected ?? parseISO(today)!

  const [view, setView] = React.useState({ y: initial.y, m: initial.m })

  // Follow the selection when it changes from outside (e.g. a preset button).
  const [syncedValue, setSyncedValue] = React.useState(value)
  if (syncedValue !== value) {
    setSyncedValue(value)
    const next = value ? parseISO(value) : null
    if (next) setView({ y: next.y, m: next.m })
  }

  const firstWeekday = new Date(view.y, view.m, 1).getDay()
  const total = daysInMonth(view.y, view.m)

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ]

  function shiftMonth(delta: number) {
    setView((v) => {
      const m = v.m + delta
      if (m < 0) return { y: v.y - 1, m: 11 }
      if (m > 11) return { y: v.y + 1, m: 0 }
      return { y: v.y, m }
    })
  }

  function isDisabled(iso: string) {
    if (min && iso < min) return true
    if (max && iso > max) return true
    return false
  }

  return (
    <div className={cn("w-64 select-none p-3", className)}>
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => shiftMonth(-1)}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-slate-900">
          {MONTHS[view.m]} {view.y}
        </span>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => shiftMonth(1)}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-0.5">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="flex h-7 items-center justify-center text-[10px] font-semibold tracking-wide text-slate-400 uppercase"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (day === null) return <div key={`pad-${i}`} className="h-8" />

          const iso = toISO(view.y, view.m, day)
          const isSelected = value === iso
          const isToday = iso === today
          const disabled = isDisabled(iso)

          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              aria-current={isToday ? "date" : undefined}
              aria-pressed={isSelected}
              onClick={() => onSelect?.(iso)}
              className={cn(
                "flex h-8 cursor-pointer items-center justify-center rounded-md text-xs font-medium tabular-nums transition-colors",
                "focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:outline-none",
                isSelected
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "text-slate-700 hover:bg-slate-100",
                !isSelected && isToday && "font-bold text-emerald-700",
                disabled &&
                  "pointer-events-none text-slate-300 line-through opacity-50"
              )}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
