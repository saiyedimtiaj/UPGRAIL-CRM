"use client"

import { Search } from "lucide-react"

import type { PaymentDirection, PaymentPartyType } from "@/lib/types"
import { SelectField } from "@/components/primitives/select-field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"

export interface PaymentsFiltersState {
  search: string
  dateFrom: string
  dateTo: string
  partyType: PaymentPartyType | "all"
  direction: PaymentDirection | "all"
}

interface PaymentsFiltersProps {
  value: PaymentsFiltersState
  onChange: (value: PaymentsFiltersState) => void
}

const PARTY_TYPE_OPTIONS = [
  { value: "all", label: "All Parties" },
  { value: "CLIENT", label: "Clients" },
  { value: "DIRECT_SELLER", label: "Direct Sellers" },
]

const DIRECTION_OPTIONS = [
  { value: "all", label: "All Directions" },
  { value: "IN", label: "In" },
  { value: "OUT", label: "Out" },
]

export function PaymentsFilters({ value, onChange }: PaymentsFiltersProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <div className="space-y-1.5 lg:col-span-1">
        <Label htmlFor="payments-search">Search</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            id="payments-search"
            value={value.search}
            onChange={(e) => onChange({ ...value, search: e.target.value })}
            placeholder="Search notes..."
            className="pl-9"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="payments-from">Date From</Label>
        <DatePicker
          id="payments-from"
          value={value.dateFrom}
          onChange={(next) => onChange({ ...value, dateFrom: next })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="payments-to">Date To</Label>
        <DatePicker
          id="payments-to"
          value={value.dateTo}
          onChange={(next) => onChange({ ...value, dateTo: next })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="payments-party">Party Type</Label>
        <SelectField
          id="payments-party"
          value={value.partyType}
          onChange={(v) => onChange({ ...value, partyType: v as PaymentsFiltersState["partyType"] })}
          options={PARTY_TYPE_OPTIONS}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="payments-direction">Direction</Label>
        <SelectField
          id="payments-direction"
          value={value.direction}
          onChange={(v) => onChange({ ...value, direction: v as PaymentsFiltersState["direction"] })}
          options={DIRECTION_OPTIONS}
        />
      </div>
    </div>
  )
}
