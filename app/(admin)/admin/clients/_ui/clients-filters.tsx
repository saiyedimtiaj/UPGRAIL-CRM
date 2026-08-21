"use client"

import { Search } from "lucide-react"

import { SelectField } from "@/components/primitives/select-field"
import { Input } from "@/components/ui/input"

export interface ClientsFiltersState {
  search: string
  active: "all" | "true" | "false"
}

interface ClientsFiltersProps {
  value: ClientsFiltersState
  onChange: (value: ClientsFiltersState) => void
}

const ACTIVE_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "true", label: "Active Only" },
  { value: "false", label: "Deactivated Only" },
]

export function ClientsFilters({ value, onChange }: ClientsFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative w-full sm:w-72">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <Input
          value={value.search}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
          placeholder="Search name, company..."
          className="pl-9"
        />
      </div>
      <SelectField
        value={value.active}
        onChange={(v) => onChange({ ...value, active: v as ClientsFiltersState["active"] })}
        options={ACTIVE_OPTIONS}
        className="w-full sm:w-48"
      />
    </div>
  )
}
