"use client"

import * as React from "react"
import { RotateCcw, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { SelectField } from "@/components/primitives/select-field"
import { SearchableSelect } from "@/components/primitives/searchable-select"

export interface FilterOption {
  value: string | number
  label: string
  sublabel?: string
}

export type FilterFieldDef =
  | {
      kind: "search"
      key: string
      label: string
      placeholder?: string
      /** Search usually earns two columns; everything else takes one. */
      span?: number
    }
  | { kind: "select"; key: string; label: string; options: FilterOption[] }
  | {
      kind: "searchable"
      key: string
      label: string
      options: FilterOption[]
      placeholder?: string
    }
  | { kind: "date"; key: string; label: string }

/**
 * The filter bar shared by every list screen.
 *
 * Each page describes the fields it wants and owns its own state; this only
 * renders them consistently. Built after the Transactions page grew a bar that
 * five other screens then needed verbatim — one implementation means a filter
 * behaves the same wherever an operator meets it.
 */
export function FilterBar<T extends Record<string, unknown>>({
  fields,
  value,
  onChange,
  onReset,
  isDirty,
  className,
}: {
  fields: FilterFieldDef[]
  value: T
  onChange: (next: T) => void
  onReset: () => void
  isDirty: boolean
  className?: string
}) {
  function set(key: string, next: unknown) {
    onChange({ ...value, [key]: next } as T)
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6",
        className
      )}
    >
      {fields.map((field) => {
        const id = `filter-${field.key}`

        if (field.kind === "search") {
          return (
            <div
              key={field.key}
              className={cn(
                "space-y-1.5",
                (field.span ?? 2) === 2 && "sm:col-span-2"
              )}
            >
              <Label htmlFor={id}>{field.label}</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id={id}
                  value={(value[field.key] as string) ?? ""}
                  onChange={(e) => set(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="pl-9"
                />
              </div>
            </div>
          )
        }

        if (field.kind === "select") {
          return (
            <div key={field.key} className="space-y-1.5">
              <Label htmlFor={id}>{field.label}</Label>
              <SelectField
                id={id}
                value={String(value[field.key] ?? "")}
                onChange={(v) => set(field.key, v)}
                options={field.options.map((o) => ({
                  value: String(o.value),
                  label: o.label,
                }))}
              />
            </div>
          )
        }

        if (field.kind === "searchable") {
          return (
            <div key={field.key} className="space-y-1.5">
              <Label htmlFor={id}>{field.label}</Label>
              <SearchableSelect
                id={id}
                value={(value[field.key] as number | undefined) ?? 0}
                onChange={(v) => set(field.key, v === 0 ? undefined : v)}
                options={field.options.map((o) => ({
                  value: Number(o.value),
                  label: o.label,
                  sublabel: o.sublabel,
                }))}
                placeholder={field.placeholder}
              />
            </div>
          )
        }

        return (
          <div key={field.key} className="space-y-1.5">
            <Label htmlFor={id}>{field.label}</Label>
            <DatePicker
              id={id}
              value={(value[field.key] as string) ?? ""}
              onChange={(next) => set(field.key, next)}
              clearable
            />
          </div>
        )
      })}

      <div className="flex items-end sm:col-span-2 xl:col-span-1">
        <Button
          variant="outline"
          disabled={!isDirty}
          onClick={onReset}
          className="w-full gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>
    </div>
  )
}
