"use client"

import * as React from "react"
import { Search } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"

export interface SearchableSelectOption<V extends string | number = string> {
  value: V
  label: string

  sublabel?: string
  disabled?: boolean
}

interface SearchableSelectProps<V extends string | number = string> {
  value: V | undefined
  onChange: (value: V) => void
  options: SearchableSelectOption<V>[]
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  className?: string
  id?: string
}

export function SearchableSelect<V extends string | number = string>({
  value,
  onChange,
  options,
  placeholder = "Select...",
  searchPlaceholder = "Type to search...",
  emptyMessage = "No matches found.",
  disabled,
  className,
  id,
}: SearchableSelectProps<V>) {
  const selected = options.find((opt) => opt.value === value)

  return (
    <Combobox
      items={options}
      value={selected ?? null}
      onValueChange={(next) => {
        if (next && typeof next === "object" && "value" in next) {
          onChange((next as SearchableSelectOption<V>).value)
        }
      }}
      itemToStringLabel={(opt) => (opt as SearchableSelectOption<V>).label}
      disabled={disabled}
    >
      <ComboboxInput
        id={id}
        placeholder={selected ? selected.label : placeholder}
        className={cn("w-full", className)}
      />
      <ComboboxContent>
        <div className="flex items-center gap-2 border-b border-zinc-100 px-2 py-1.5 text-xs text-slate-400">
          <Search className="h-3.5 w-3.5" />
          {searchPlaceholder}
        </div>
        <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
        <ComboboxList>
          {(item: SearchableSelectOption<V>) => (
            <ComboboxItem
              key={item.value}
              value={item}
              disabled={item.disabled}
            >
              <div className="min-w-0 flex-1">
                <div className="truncate">{item.label}</div>
                {item.sublabel && (
                  <div className="truncate text-[11px] text-slate-400">
                    {item.sublabel}
                  </div>
                )}
              </div>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
