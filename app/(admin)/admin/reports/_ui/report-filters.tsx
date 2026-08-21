"use client"

import { useActiveClients } from "@/features/use-clients"
import { useActiveSellers } from "@/features/use-sellers"
import { SectionCard } from "@/components/primitives/section-card"
import { SearchableSelect } from "@/components/primitives/searchable-select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface ReportFiltersState {
  dateFrom: string
  dateTo: string
  clientId: number | "all"
  sellerId: number | "all"
}

interface ReportFiltersProps {
  value: ReportFiltersState
  onChange: (value: ReportFiltersState) => void
}


export function ReportFilters({ value, onChange }: ReportFiltersProps) {
  const { data: clients = [] } = useActiveClients()
  const { data: sellers = [] } = useActiveSellers()

  return (
    <SectionCard
      title="Filter Trades"
      subtitle="Narrow the report by date range, client, or sourcing desk"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor="report-from">Date From</Label>
          <Input
            id="report-from"
            type="date"
            value={value.dateFrom}
            onChange={(e) => onChange({ ...value, dateFrom: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="report-to">Date To</Label>
          <Input
            id="report-to"
            type="date"
            value={value.dateTo}
            onChange={(e) => onChange({ ...value, dateTo: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="report-client">Client</Label>
          <SearchableSelect
            id="report-client"
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
          <Label htmlFor="report-seller">Seller Desk</Label>
          <SearchableSelect
            id="report-seller"
            value={value.sellerId}
            onChange={(v) => onChange({ ...value, sellerId: v })}
            placeholder="All Sourcing Desks"
            searchPlaceholder="Search sellers..."
            options={[
              { value: "all" as const, label: "All Sourcing Desks" },
              ...sellers.map((s) => ({
                value: s.id as number | "all",
                label: `${s.flag} ${s.name}`,
                sublabel: s.region,
              })),
            ]}
          />
        </div>
      </div>
    </SectionCard>
  )
}
