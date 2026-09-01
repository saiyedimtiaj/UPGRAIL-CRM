"use client"

import * as React from "react"
import { Loader2, Save } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface RateInputRowProps {
  label: string
  hint?: string
  value: string
  onChange: (value: string) => void
  onSave: () => void
  tone?: "dark" | "light"
  prefix?: React.ReactNode
  disabled?: boolean
  isSaving?: boolean
}

export function RateInputRow({
  label,
  hint,
  value,
  onChange,
  onSave,
  tone = "light",
  prefix,
  disabled,
  isSaving = false,
}: RateInputRowProps) {
  const isBusy = disabled || isSaving

  return (
    <div className="flex items-center gap-3">
      {prefix}
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "truncate text-xs font-bold",
            tone === "dark" ? "text-white" : "text-slate-800"
          )}
        >
          {label}
        </div>
        {hint && (
          <div
            className={cn(
              "truncate text-[10px] font-medium",
              tone === "dark" ? "text-zinc-400" : "text-slate-400"
            )}
          >
            {hint}
          </div>
        )}
      </div>
      <Input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !isBusy) {
            e.preventDefault()
            onSave()
          }
        }}
        disabled={isBusy}
        className={cn(
          "w-28 font-mono",
          tone === "dark" &&
            "border-white/10 bg-white/5 text-white placeholder:text-zinc-500"
        )}
      />
      <Button
        size="icon-sm"
        variant={tone === "dark" ? "secondary" : "outline"}
        onClick={onSave}
        disabled={isBusy}
        aria-busy={isSaving}
        aria-label={isSaving ? `Saving ${label} rate` : `Save ${label} rate`}
      >
        {isSaving ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Save className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  )
}
