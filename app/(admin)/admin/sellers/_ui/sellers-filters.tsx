"use client"

import { Search } from "lucide-react"

import type { SellerRateType } from "@/lib/types"
import { SelectField } from "@/components/primitives/select-field"
import { Input } from "@/components/ui/input"

export interface SellersFiltersState {
  search: string
  active: "all" | "true" | "false"
  rateType: SellerRateType | "all"
}

interface SellersFiltersProps {
  value: SellersFiltersState
  onChange: (value: SellersFiltersState) => void
}

const ACTIVE_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "true", label: "Active Only" },
  { value: "false", label: "Deactivated Only" },
]

// rate_type no longer affects pricing (spec §6.2 — Card Rate is entered per
// transaction for every seller) but the field/filter still exists on the
// backend as legacy metadata, so it's kept here relabeled to avoid implying
// it changes trade math.
const RATE_TYPE_OPTIONS = [
  { value: "all", label: "All Sellers" },
  { value: "DIRECT", label: "Legacy: Direct" },
  { value: "CARD", label: "Legacy: Card" },
]

export function SellersFilters({ value, onChange }: SellersFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative w-full sm:w-72">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <Input
          value={value.search}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
          placeholder="Search seller name..."
          className="pl-9"
        />
      </div>
      <SelectField
        value={value.rateType}
        onChange={(v) => onChange({ ...value, rateType: v as SellersFiltersState["rateType"] })}
        options={RATE_TYPE_OPTIONS}
        className="w-full sm:w-44"
      />
      <SelectField
        value={value.active}
        onChange={(v) => onChange({ ...value, active: v as SellersFiltersState["active"] })}
        options={ACTIVE_OPTIONS}
        className="w-full sm:w-48"
      />
    </div>
  )
}
