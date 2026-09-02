"use client"

import { Search } from "lucide-react"

import type { Client, ProfitStatus, Seller } from "@/lib/types"
import { SelectField } from "@/components/primitives/select-field"
import { SearchableSelect } from "@/components/primitives/searchable-select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"

export interface TradesFiltersState {
  search: string
  dateFrom: string
  dateTo: string
  clientId: number | "all"
  sellerId: number | "all"
  profitStatus: ProfitStatus | "all"
  voided: "all" | "true" | "false"
}

interface TradesFiltersProps {
  value: TradesFiltersState
  onChange: (value: TradesFiltersState) => void
  clients: Client[]
  sellers: Seller[]
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "AWAITING_DAILY_RATE", label: "Awaiting Daily Rate" },
  { value: "PENDING_UNSETTLED", label: "Pending — Unsettled" },
  { value: "PENDING_PARTIAL", label: "Pending — Partial" },
  { value: "FINALIZED", label: "Finalized" },
]

const VOIDED_OPTIONS = [
  { value: "all", label: "Voided + Active" },
  { value: "false", label: "Active Only" },
  { value: "true", label: "Voided Only" },
]

export function TradesFilters({ value, onChange, clients, sellers }: TradesFiltersProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      <div className="space-y-1.5 xl:col-span-2">
        <Label htmlFor="trades-search">Search</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            id="trades-search"
            value={value.search}
            onChange={(e) => onChange({ ...value, search: e.target.value })}
            placeholder="Notes, entered by..."
            className="pl-9"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="trades-from">Date From</Label>
        <DatePicker
          id="trades-from"
          value={value.dateFrom}
          onChange={(next) => onChange({ ...value, dateFrom: next })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="trades-to">Date To</Label>
        <DatePicker
          id="trades-to"
          value={value.dateTo}
          onChange={(next) => onChange({ ...value, dateTo: next })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="trades-client">Client</Label>
        <SearchableSelect
          id="trades-client"
          value={value.clientId}
          onChange={(v) => onChange({ ...value, clientId: v })}
          placeholder="All Clients"
          searchPlaceholder="Search clients..."
          options={[
            { value: "all" as const, label: "All Clients" },
            ...clients.map((c) => ({
              value: c.id as number | "all",
              label: c.name,
              sublabel: c.company,
            })),
          ]}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="trades-seller">Seller</Label>
        <SearchableSelect
          id="trades-seller"
          value={value.sellerId}
          onChange={(v) => onChange({ ...value, sellerId: v })}
          placeholder="All Sellers"
          searchPlaceholder="Search sellers..."
          options={[
            { value: "all" as const, label: "All Sellers" },
            ...sellers.map((s) => ({
              value: s.id as number | "all",
              label: `${s.flag} ${s.name}`,
              sublabel: s.region,
            })),
          ]}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="trades-status">Profit Status</Label>
        <SelectField
          id="trades-status"
          value={value.profitStatus}
          onChange={(v) => onChange({ ...value, profitStatus: v as ProfitStatus | "all" })}
          options={STATUS_OPTIONS}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="trades-voided">Voided</Label>
        <SelectField
          id="trades-voided"
          value={value.voided}
          onChange={(v) => onChange({ ...value, voided: v as TradesFiltersState["voided"] })}
          options={VOIDED_OPTIONS}
        />
      </div>
    </div>
  )
}
