"use client"

import * as React from "react"

import { isoDaysAgo, todayISO } from "@/lib/date"
import { useTransactions } from "@/features/use-transactions"
import { useSettings } from "@/features/use-settings"
import {
  ReportFilters,
  type ReportFiltersState,
} from "@/app/(admin)/admin/reports/_ui/report-filters"
import { ReportSummary } from "@/app/(admin)/admin/reports/_ui/report-summary"
import { ExportCard } from "@/app/(admin)/admin/reports/_ui/export-card"
import { FilteredTradesTable } from "@/app/(admin)/admin/reports/_ui/filtered-trades-table"

export default function ReportsPage() {
  const today = todayISO()
  const { data: settings } = useSettings()

  const [filters, setFilters] = React.useState<ReportFiltersState>({
    dateFrom: isoDaysAgo(30, today),
    dateTo: today,
    clientId: "all",
    sellerId: "all",
  })

  const dateFromTouched = React.useRef(false)
  const reportWindowDays = settings?.defaultReportWindowDays
  React.useEffect(() => {
    if (dateFromTouched.current || reportWindowDays === undefined) return
    setFilters((f) => ({
      ...f,
      dateFrom: isoDaysAgo(reportWindowDays, today),
    }))
  }, [reportWindowDays, today])

  const { data, isPending } = useTransactions({
    limit: 1000,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    clientId: filters.clientId === "all" ? undefined : filters.clientId,
    sellerId: filters.sellerId === "all" ? undefined : filters.sellerId,
  })

  const filteredTrades = data?.data ?? []

  function handleFiltersChange(next: ReportFiltersState) {
    dateFromTouched.current = true
    setFilters(next)
  }

  return (
    <div className="w-full space-y-5 p-4 sm:space-y-6 sm:p-6">
      <ReportFilters value={filters} onChange={handleFiltersChange} />

      <ReportSummary trades={filteredTrades} isLoading={isPending} />

      <ExportCard trades={filteredTrades} />

      <FilteredTradesTable trades={filteredTrades} isLoading={isPending} />
    </div>
  )
}
