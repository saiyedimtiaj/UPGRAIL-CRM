"use client"

import { Search } from "lucide-react"

import type { AuditAction } from "@/lib/types"
import { SelectField } from "@/components/primitives/select-field"
import { Input } from "@/components/ui/input"

const ACTION_OPTIONS: { value: AuditAction | "all"; label: string }[] = [
  { value: "all", label: "All Actions" },
  { value: "RATE_UPDATE", label: "Rate Updates" },
  { value: "CREATE", label: "Trade Creations" },
  { value: "VOID", label: "Voids" },
  { value: "SETTLEMENT", label: "USDT Settlements" },
  { value: "SETTLEMENT_ALLOCATION", label: "Settlement Allocations" },
  { value: "PAYMENT", label: "Payments" },
  { value: "TRANSFER", label: "Transfers" },
  { value: "EDIT", label: "Edits" },
  { value: "DELETE", label: "Deletions" },
]

interface AuditFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  action: AuditAction | "all"
  onActionChange: (value: AuditAction | "all") => void
}

export function AuditFilters({
  search,
  onSearchChange,
  action,
  onActionChange,
}: AuditFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative w-full sm:w-80">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search user, entity, reason..."
          className="pl-9"
        />
      </div>
      <SelectField
        value={action}
        onChange={(v) => onActionChange(v as AuditAction | "all")}
        options={ACTION_OPTIONS}
        className="w-full sm:w-56"
      />
    </div>
  )
}
