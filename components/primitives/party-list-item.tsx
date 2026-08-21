"use client"

import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { staggerChild } from "@/lib/animations"
import { BalancePill } from "@/components/primitives/balance-pill"

interface PartyListItemProps {
  title: string
  subtitle: string
  balance: number
  selected: boolean
  onSelect: () => void
  leading?: React.ReactNode
}

export function PartyListItem({
  title,
  subtitle,
  balance,
  selected,
  onSelect,
  leading,
}: PartyListItemProps) {
  return (
    <motion.button
      variants={staggerChild}
      onClick={onSelect}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors",
        selected
          ? "border-emerald-500/30 bg-brand-ink text-white shadow-lg"
          : "border-zinc-200/80 bg-white hover:border-emerald-200 hover:bg-emerald-50/40"
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {leading}
        <div className="min-w-0">
          <div
            className={cn(
              "truncate text-sm font-bold",
              selected ? "text-white" : "text-slate-900"
            )}
          >
            {title}
          </div>
          <div
            className={cn(
              "truncate text-[11px] font-medium",
              selected ? "text-zinc-400" : "text-slate-500"
            )}
          >
            {subtitle}
          </div>
        </div>
      </div>
      <BalancePill balance={balance} onDark={selected} />
    </motion.button>
  )
}
