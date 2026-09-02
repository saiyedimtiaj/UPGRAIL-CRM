"use client"

import * as React from "react"
import { CalendarDays, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { shortDate } from "@/lib/date"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface DatePickerProps {
  /** `YYYY-MM-DD`, matching what the API stores and what the old
   *  `<Input type="date">` produced — so call sites swap one-for-one. */
  value: string
  onChange: (value: string) => void
  id?: string
  placeholder?: string
  min?: string
  max?: string
  disabled?: boolean
  clearable?: boolean
  className?: string
}

export function DatePicker({
  value,
  onChange,
  id,
  placeholder = "Pick a date",
  min,
  max,
  disabled,
  clearable = false,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            id={id}
            type="button"
            disabled={disabled}
            className={cn(
              "flex h-10 w-full cursor-pointer items-center gap-2 rounded-lg border border-input bg-transparent px-3 py-2 text-left text-sm transition-colors outline-none",
              "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
              !value && "text-muted-foreground",
              className
            )}
          >
            <CalendarDays
              aria-hidden
              className="h-4 w-4 shrink-0 text-slate-400"
            />
            <span className="flex-1 truncate">
              {value ? shortDate(value) : placeholder}
            </span>
            {clearable && value && !disabled ? (
              <span
                role="button"
                tabIndex={-1}
                aria-label="Clear date"
                onClick={(e) => {
                  // Clear without opening the calendar.
                  e.stopPropagation()
                  onChange("")
                }}
                className="rounded p-0.5 text-slate-400 transition-colors hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            ) : null}
          </button>
        }
      />
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          value={value || null}
          min={min}
          max={max}
          onSelect={(iso) => {
            onChange(iso)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
