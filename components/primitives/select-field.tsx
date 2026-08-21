"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface SelectFieldOption {
  value: string
  label: React.ReactNode
  disabled?: boolean
}

interface SelectFieldProps {
  value: string | undefined
  /** Normalizes Base UI's onValueChange(value, eventDetails) to (value) => void. */
  onChange: (value: string) => void
  options: SelectFieldOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  /** "default" = standard bordered trigger. "pill-dark" = rounded-full dark trigger for compact filters. */
  variant?: "default" | "pill-dark"
}

const PILL_DARK_TRIGGER =
  "h-auto w-fit gap-1 rounded-full border-emerald-500/20 bg-brand-ink px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-ink-hover data-[size=default]:h-auto [&_svg]:text-zinc-400"

export function SelectField({
  value,
  onChange,
  options,
  placeholder = "Select...",
  disabled,
  className,
  id,
  variant = "default",
}: SelectFieldProps) {
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (typeof next === "string") onChange(next)
      }}
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
        className={cn(
          variant === "pill-dark" ? PILL_DARK_TRIGGER : "w-full",
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
