"use client"

import type { Client } from "@/lib/types"
import { SearchableSelect } from "@/components/primitives/searchable-select"

interface ClientComboboxProps {
  clients: Client[]
  value: number | undefined
  onChange: (value: number) => void
  placeholder?: string
  disabled?: boolean
  id?: string
  className?: string
}

export function ClientCombobox({
  clients,
  value,
  onChange,
  placeholder = "Select client...",
  disabled,
  id,
  className,
}: ClientComboboxProps) {
  return (
    <SearchableSelect
      id={id}
      className={className}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      searchPlaceholder="Search clients by name..."
      emptyMessage="No matching clients."
      options={clients.map((c) => ({
        value: c.id,
        label: c.name,
        sublabel: c.company,
      }))}
    />
  )
}
