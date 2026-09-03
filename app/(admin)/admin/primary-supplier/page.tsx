"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, Landmark } from "lucide-react"

import { bdt, usdt } from "@/lib/format"
import { useBalances } from "@/features/use-analytics"
import { useActiveSellers } from "@/features/use-sellers"
import { findConduitSeller } from "@/lib/calc/rates"
import { PageHeader } from "@/components/primitives/page-header"
import { SectionCard } from "@/components/primitives/section-card"
import { StatCard } from "@/components/primitives/stat-card"
import { Skeleton } from "@/components/ui/skeleton"
import EmptyState from "@/components/shared/empty-state"
import { TransactionsTable } from "@/components/shared/transactions-table"
import { FilterBar, type FilterFieldDef } from "@/components/shared/filter-bar"
import { useUrlFilters } from "@/hooks/use-url-filters"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useActiveClients } from "@/features/use-clients"
import { useSettlements } from "@/features/use-settlements"
import { PAGE_SIZE, toDataTablePagination } from "@/lib/pagination"
import { shortDate } from "@/lib/date"
import DataTable, {
  type DataTableColumn,
} from "@/components/shared/data-table"
import { Bdt, Usdt } from "@/components/primitives/money"
import type { ProfitStatus, USDTSettlement } from "@/lib/types"

const EMPTY_FILTERS = {
  clientId: undefined as number | undefined,
  status: "all",
  dateFrom: "",
  dateTo: "",
  search: "",
}

export default function PrimarySupplierPage() {
  const { data: sellers = [], isPending } = useActiveSellers()
  const { data: balances } = useBalances()
  const { data: clients = [] } = useActiveClients()

  // Declared before the loading early-return so the hook order never changes.
  const { filters, setFilters, reset, isDirty } = useUrlFilters(EMPTY_FILTERS)
  const debouncedSearch = useDebouncedValue(filters.search)

  const txQuery = {
    clientId: filters.clientId,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    search: debouncedSearch || undefined,
    ...(filters.status === "all"
      ? {}
      : filters.status === "VOIDED"
        ? { voided: true }
        : { profitStatus: filters.status as ProfitStatus, voided: false }),
  }

  const filterFields: FilterFieldDef[] = [
    {
      kind: "search",
      key: "search",
      label: "Search",
      placeholder: "Search by ID or client…",
    },
    {
      kind: "searchable",
      key: "clientId",
      label: "Client",
      options: [
        { value: 0, label: "All Clients" },
        ...clients.map((c) => ({ value: c.id, label: c.name })),
      ],
      placeholder: "All Clients",
    },
    {
      kind: "select",
      key: "status",
      label: "Status",
      options: [
        { value: "all", label: "All" },
        { value: "FINALIZED", label: "Finalized" },
        { value: "AWAITING_DAILY_RATE", label: "Awaiting Rate" },
        { value: "PENDING_UNSETTLED", label: "Pending" },
        { value: "PENDING_PARTIAL", label: "Partially Settled" },
        { value: "VOIDED", label: "Cancelled" },
      ],
    },
    { kind: "date", key: "dateFrom", label: "Date From" },
    { kind: "date", key: "dateTo", label: "Date To" },
  ]

  const conduit = findConduitSeller(sellers)

  if (isPending) {
    return (
      <div className="w-full space-y-5 p-4 sm:p-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (!conduit) {
    return (
      <div className="w-full p-4 sm:p-6">
        <EmptyState
          title="No settlement conduit configured"
          description="Mark one seller as the settlement conduit to see their ledger here."
          action={
            <Link
              href="/admin/sellers"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:underline"
            >
              Go to Sellers <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
      </div>
    )
  }

  const obligationsHeld = balances?.sellerObligationsHeld?.[conduit.id] ?? 0

  return (
    <div className="w-full space-y-5 p-4 sm:space-y-6 sm:p-6">
      <PageHeader
        icon={Landmark}
        title={conduit.name}
        subtitle="Primary supplier — settles external sellers on the business's behalf"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          tone="dark"
          icon={Landmark}
          label="Amount Payable (BDT)"
          value={balances?.nazmulDue ?? 0}
          format={(n) => bdt(n)}
          footer={
            <span className="text-[11px] font-semibold text-zinc-400">
              What the business owes the conduit
            </span>
          }
        />
        <StatCard
          accent="violet"
          icon={ArrowRight}
          label="Obligations Held (USDT)"
          value={obligationsHeld}
          format={(n) => usdt(n)}
          footer={
            <span className="text-[11px] font-semibold text-slate-500">
              Other sellers&rsquo; USDT taken over, still owed onward
            </span>
          }
        />
      </div>

      <SectionCard>
        <FilterBar
          fields={filterFields}
          value={filters}
          onChange={setFilters}
          onReset={reset}
          isDirty={isDirty}
        />
      </SectionCard>

      <SectionCard
        title="Transactions"
        subtitle="Trades sourced directly through the conduit"
      >
        <TransactionsTable
          // The seller is pinned to the conduit — this page is that seller's
          // view, so it is not one of the operator's filters.
          filters={{ sellerId: conduit.id, ...txQuery }}
          hide={["seller"]}
          emptyLabel="transactions"
        />
      </SectionCard>

      <SectionCard
        title="Settlements Paid By This Supplier"
        subtitle="USDT settlements this conduit funded"
      >
        <ConduitSettlements conduitId={conduit.id} />
      </SectionCard>
    </div>
  )
}

/**
 * The settlements this conduit funded.
 *
 * A compact read-only view — voiding and editing stay on the Settlements
 * screen, which owns those actions and their confirmations.
 */
function ConduitSettlements({ conduitId }: { conduitId: number }) {
  const [page, setPage] = React.useState(1)
  const { data, isPending } = useSettlements({
    page,
    limit: PAGE_SIZE,
    paidBy: conduitId,
  })

  const columns: DataTableColumn<USDTSettlement>[] = [
    {
      key: "date",
      header: "Date",
      cell: (s) => (
        <span className="text-xs font-semibold text-slate-600">
          {shortDate(s.date)}
        </span>
      ),
    },
    {
      key: "seller",
      header: "Seller Settled",
      cell: (s) => (
        <span className="text-sm font-bold text-slate-900">
          {s.seller?.name ?? `Seller #${s.seller_id}`}
        </span>
      ),
    },
    {
      key: "usdt",
      header: "USDT",
      align: "right",
      cell: (s) => <Usdt value={s.usdt_amount} />,
    },
    {
      key: "rate",
      header: "Rate",
      align: "right",
      cell: (s) => (
        <span className="font-mono text-xs text-slate-500">{s.usdt_rate}</span>
      ),
    },
    {
      key: "bdt",
      header: "BDT Equivalent",
      align: "right",
      cell: (s) => <Bdt value={s.bdt_equivalent} />,
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={data?.data ?? []}
      rowKey={(s) => s.id}
      entityLabel="settlements"
      isLoading={isPending}
      pagination={toDataTablePagination(data?.meta)}
      onPageChange={setPage}
    />
  )
}
