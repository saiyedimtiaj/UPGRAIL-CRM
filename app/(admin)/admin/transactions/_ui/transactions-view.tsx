"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Download, RotateCcw, Search, Zap } from "lucide-react"

import type { ProfitStatus } from "@/lib/types"
import { useActiveClients } from "@/features/use-clients"
import { useActiveSellers } from "@/features/use-sellers"
import {
  useTransactions,
  useTransactionStats,
} from "@/features/use-transactions"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { downloadCSV, toCSV } from "@/lib/csv"
import { shortDate, todayISO } from "@/lib/date"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
import { SelectField } from "@/components/primitives/select-field"
import { SearchableSelect } from "@/components/primitives/searchable-select"
import { SectionCard } from "@/components/primitives/section-card"
import { PageHeader } from "@/components/primitives/page-header"
import { TransactionsTable } from "@/components/shared/transactions-table"
import { TransactionStatsRow } from "./transaction-stats"

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "FINALIZED", label: "Finalized" },
  { value: "PENDING_UNSETTLED", label: "Awaiting Settlement" },
  { value: "PENDING_PARTIAL", label: "Partial Settlement" },
  { value: "AWAITING_DAILY_RATE", label: "Awaiting Rate" },
  { value: "VOIDED", label: "Cancelled" },
]

const EMPTY = {
  search: "",
  status: "all",
  clientId: undefined as number | undefined,
  sellerId: undefined as number | undefined,
  dateFrom: "",
  dateTo: "",
}

export function TransactionsView() {
  const router = useRouter()
  const params = useSearchParams()

  const [filters, setFilters] = React.useState({
    ...EMPTY,
    status: params.get("status") ?? "all",
  })

  const { data: clients = [] } = useActiveClients()
  const { data: sellers = [] } = useActiveSellers()

  const debouncedSearch = useDebouncedValue(filters.search)
  const isDirty = JSON.stringify({ ...filters, search: "" }) !==
    JSON.stringify({ ...EMPTY, search: "" }) || filters.search !== ""

  // "Cancelled" is the voided flag, not a profit status — keep the two apart
  // so the query means what the label says.
  const query = {
    clientId: filters.clientId,
    sellerId: filters.sellerId,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    search: debouncedSearch || undefined,
    ...(filters.status === "all"
      ? {}
      : filters.status === "VOIDED"
        ? { voided: true }
        : { profitStatus: filters.status as ProfitStatus, voided: false }),
  }

  const { data: stats, isPending: statsPending } = useTransactionStats({
    clientId: query.clientId,
    sellerId: query.sellerId,
    dateFrom: query.dateFrom,
    dateTo: query.dateTo,
    search: query.search,
  })

  // Export pulls the current filter set, not just the visible page.
  const { data: exportable } = useTransactions({ ...query, limit: 500 })

  function handleExport() {
    const rows = exportable?.data ?? []
    const csv = toCSV(
      [
        "ID",
        "Date",
        "Client",
        "Seller",
        "USD Amount",
        "Card Rate (%)",
        "Client Rate (BDT)",
        "Client Charge (BDT)",
        "Seller Due (USDT)",
        "Profit (BDT)",
        "Status",
      ],
      rows.map((t) => [
        `TRX-${t.id}`,
        shortDate(t.date),
        t.client?.name ?? t.client_id,
        t.seller?.name ?? t.seller_id,
        t.usd_amount,
        t.card_rate,
        t.client_rate ?? "",
        t.sell_bdt ?? "",
        t.seller_usdt_entitlement - t.settled_usdt,
        t.profit ?? "",
        t.voided ? "Cancelled" : t.profit_status,
      ])
    )
    downloadCSV(csv, `transactions-${todayISO()}.csv`)
  }

  return (
    <div className="w-full space-y-5 p-4 sm:space-y-6 sm:p-6">
      <PageHeader
        title="Transactions"
        subtitle="All client transactions and their current status"
      >
        <Button variant="outline" onClick={handleExport} className="gap-1.5">
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
        <Button
          onClick={() => router.push("/admin/trades")}
          className="gap-1.5"
        >
          <Zap className="h-3.5 w-3.5" />
          New Transaction
        </Button>
      </PageHeader>

      <TransactionStatsRow stats={stats} isLoading={statsPending} />

      <SectionCard>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="tx-search">Search</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="tx-search"
                value={filters.search}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, search: e.target.value }))
                }
                placeholder="Search by ID, client, or seller…"
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tx-status">Status</Label>
            <SelectField
              id="tx-status"
              value={filters.status}
              onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
              options={STATUS_OPTIONS}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tx-seller">Seller</Label>
            <SearchableSelect
              id="tx-seller"
              value={filters.sellerId}
              onChange={(v) => setFilters((f) => ({ ...f, sellerId: v }))}
              options={[
                { value: 0, label: "All Sellers" },
                ...sellers.map((s) => ({ value: s.id, label: s.name })),
              ]}
              placeholder="All Sellers"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tx-client">Client</Label>
            <SearchableSelect
              id="tx-client"
              value={filters.clientId}
              onChange={(v) => setFilters((f) => ({ ...f, clientId: v }))}
              options={[
                { value: 0, label: "All Clients" },
                ...clients.map((c) => ({ value: c.id, label: c.name })),
              ]}
              placeholder="All Clients"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tx-from">Date From</Label>
            <DatePicker
              id="tx-from"
              value={filters.dateFrom}
              onChange={(next) => setFilters((f) => ({ ...f, dateFrom: next }))}
              clearable
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tx-to">Date To</Label>
            <DatePicker
              id="tx-to"
              value={filters.dateTo}
              onChange={(next) => setFilters((f) => ({ ...f, dateTo: next }))}
              clearable
            />
          </div>

          <div className="flex items-end sm:col-span-2 xl:col-span-1">
            <Button
              variant="outline"
              disabled={!isDirty}
              onClick={() => setFilters(EMPTY)}
              className="w-full gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          </div>
        </div>
      </SectionCard>

      <TransactionsTable
        filters={{
          clientId: filters.clientId || undefined,
          sellerId: filters.sellerId || undefined,
          dateFrom: filters.dateFrom || undefined,
          dateTo: filters.dateTo || undefined,
          search: debouncedSearch || undefined,
          ...(filters.status === "all"
            ? {}
            : filters.status === "VOIDED"
              ? { voided: true }
              : {
                  profitStatus: filters.status as ProfitStatus,
                  voided: false,
                }),
        }}
      />
    </div>
  )
}
