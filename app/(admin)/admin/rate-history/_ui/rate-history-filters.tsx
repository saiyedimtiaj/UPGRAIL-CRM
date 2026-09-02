"use client"

import type { PartyType, RateKind } from "@/lib/types"
import { SelectField } from "@/components/primitives/select-field"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"

export interface RateHistoryFiltersState {
  dateFrom: string
  dateTo: string
  partyType: PartyType | "all"
  kind: RateKind | "all"
}

interface RateHistoryFiltersProps {
  value: RateHistoryFiltersState
  onChange: (value: RateHistoryFiltersState) => void
}

const PARTY_TYPE_OPTIONS = [
  { value: "all", label: "All Parties" },
  { value: "CLIENT", label: "Clients" },
  { value: "SELLER", label: "Sellers" },
]

const KIND_OPTIONS = [
  { value: "all", label: "All Kinds" },
  { value: "DIRECT", label: "Direct BDT" },
  { value: "CARD", label: "Card %" },
  { value: "USDT", label: "USDT" },
]

export function RateHistoryFilters({ value, onChange }: RateHistoryFiltersProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-1.5">
        <Label htmlFor="rate-history-from">Date From</Label>
        <DatePicker
          id="rate-history-from"
          value={value.dateFrom}
          onChange={(next) => onChange({ ...value, dateFrom: next })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="rate-history-to">Date To</Label>
        <DatePicker
          id="rate-history-to"
          value={value.dateTo}
          onChange={(next) => onChange({ ...value, dateTo: next })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="rate-history-party">Party Type</Label>
        <SelectField
          id="rate-history-party"
          value={value.partyType}
          onChange={(v) => onChange({ ...value, partyType: v as PartyType | "all" })}
          options={PARTY_TYPE_OPTIONS}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="rate-history-kind">Kind</Label>
        <SelectField
          id="rate-history-kind"
          value={value.kind}
          onChange={(v) => onChange({ ...value, kind: v as RateKind | "all" })}
          options={KIND_OPTIONS}
        />
      </div>
    </div>
  )
}
