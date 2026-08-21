"use client"

import { motion } from "motion/react"
import { cn } from "@/lib/utils"

interface FilterPillsProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
  className?: string
}

export function FilterPills<T extends string>({
  value,
  onChange,
  options,
  className,
}: FilterPillsProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white p-1",
        className
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              active ? "text-white" : "text-slate-500 hover:text-slate-800"
            )}
          >
            {active && (
              <motion.span
                layoutId="filter-pill-active"
                className="absolute inset-0 rounded-full bg-brand-ink"
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}
