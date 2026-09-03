"use client"

import * as React from "react"
import Link from "next/link"

import type { ProfitStatus, Transaction } from "@/lib/types"
import { useTransactions } from "@/features/use-transactions"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { PAGE_SIZE, toDataTablePagination } from "@/lib/pagination"
import { shortDate, timeOnly } from "@/lib/date"
import { Bdt, Usdt } from "@/components/primitives/money"
import { ProfitStatusBadge } from "@/components/primitives/profit-status-badge"
import DataTable, { type DataTableColumn } from "@/components/shared/data-table"

export type TransactionColumnKey =
  | "id"
  | "date"
  | "client"
  | "seller"
  | "usd"
  | "cardRate"
  | "clientRate"
  | "clientCharge"
  | "sellerDue"
  | "profit"
  | "status"

export interface TransactionsTableFilters {
  clientId?: number
  sellerId?: number
  dateFrom?: string
  dateTo?: string
  profitStatus?: ProfitStatus | ProfitStatus[]
  voided?: boolean
  search?: string
}

/**
 * The one transactions table.
 *
 * Used by the Transactions page, client detail and seller detail — the three
 * places that previously each had their own near-identical table. `hide` lets
 * a caller drop the columns it already implies (a client's page does not need
 * a Client column).
 */
export function TransactionsTable({
  filters = {},
  hide = [],
  actions,
  emptyLabel = "transactions",
}: {
  filters?: TransactionsTableFilters
  hide?: TransactionColumnKey[]
  actions?: (row: Transaction) => React.ReactNode
  emptyLabel?: string
}) {
  const [page, setPage] = React.useState(1)
  const debouncedSearch = useDebouncedValue(filters.search ?? "")

  // Any filter change invalidates the current page number.
  const filterKey = JSON.stringify({ ...filters, search: debouncedSearch })
  const [seenKey, setSeenKey] = React.useState(filterKey)
  if (seenKey !== filterKey) {
    setSeenKey(filterKey)
    if (page !== 1) setPage(1)
  }

  const { data, isPending, isFetching } = useTransactions({
    page,
    limit: PAGE_SIZE,
    ...filters,
    search: debouncedSearch || undefined,
  })

  const rows = data?.data ?? []
  const skip = new Set(hide)

  const all: (DataTableColumn<Transaction> & { key: TransactionColumnKey })[] = [
    {
      key: "id",
      header: "ID",
      cell: (t) => (
        <Link
          href={`/admin/trades?search=${t.id}`}
          className="font-mono text-xs font-semibold text-sky-700 hover:underline"
        >
          TRX-{t.id}
        </Link>
      ),
    },
    {
      key: "date",
      header: "Date",
      cell: (t) => (
        <div className="leading-tight">
          <div className="text-xs font-medium text-slate-700">
            {shortDate(t.date)}
          </div>
          <div className="text-[10px] text-slate-400">
            {timeOnly(t.created_at)}
          </div>
        </div>
      ),
    },
    {
      key: "client",
      header: "Client",
      cell: (t) => (
        <Link
          href={`/admin/clients/${t.client_id}`}
          className="text-xs font-semibold text-slate-800 hover:underline"
        >
          {t.client?.name ?? `Client #${t.client_id}`}
        </Link>
      ),
    },
    {
      key: "seller",
      header: "Seller",
      hideBelow: "md",
      cell: (t) => (
        <Link
          href={`/admin/sellers/${t.seller_id}`}
          className="text-xs text-slate-600 hover:underline"
        >
          {t.seller?.name ?? `Seller #${t.seller_id}`}
        </Link>
      ),
    },
    {
      key: "usd",
      header: "USD Amount",
      align: "right",
      cell: (t) => (
        <span className="font-mono text-xs tabular-nums">
          ${t.usd_amount.toLocaleString()}
        </span>
      ),
    },
    {
      key: "cardRate",
      header: "Card Rate",
      align: "right",
      hideBelow: "lg",
      cell: (t) => (
        <span className="font-mono text-xs tabular-nums text-slate-600">
          {t.card_rate}%
        </span>
      ),
    },
    {
      key: "clientRate",
      header: "Client Rate (BDT)",
      align: "right",
      hideBelow: "xl",
      cell: (t) =>
        t.client_rate ? (
          <span className="font-mono text-xs tabular-nums">
            {t.client_rate}
          </span>
        ) : (
          <span className="text-[10px] text-slate-400">Awaiting rate</span>
        ),
    },
    {
      key: "clientCharge",
      header: "Client Charge (BDT)",
      align: "right",
      cell: (t) =>
        t.sell_bdt ? (
          <Bdt value={t.sell_bdt} className="text-xs font-semibold" />
        ) : (
          <span className="text-[10px] text-slate-400">Awaiting rate</span>
        ),
    },
    {
      key: "sellerDue",
      header: "Seller Due (USDT)",
      align: "right",
      hideBelow: "lg",
      cell: (t) => (
        <Usdt
          value={t.seller_usdt_entitlement - t.settled_usdt}
          className="text-xs"
        />
      ),
    },
    {
      key: "profit",
      header: "Profit (BDT)",
      align: "right",
      cell: (t) =>
        t.profit !== undefined && t.profit !== null ? (
          <Bdt
            value={t.profit}
            className={
              t.profit < 0
                ? "text-xs font-semibold text-rose-600"
                : "text-xs font-semibold text-emerald-700"
            }
          />
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      cell: (t) =>
        t.voided ? (
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
            Cancelled
          </span>
        ) : (
          <ProfitStatusBadge status={t.profit_status} />
        ),
    },
  ]

  const columns: DataTableColumn<Transaction>[] = all.filter(
    (c) => !skip.has(c.key)
  )

  if (actions) {
    columns.push({
      key: "actions",
      header: "Action",
      align: "right",
      cell: (t) => actions(t),
    })
  }

  return (
    <DataTable
      columns={columns}
      data={rows}
      rowKey={(t) => t.id}
      isLoading={isPending}
      rowClassName={(t) => (t.voided ? "opacity-60" : "")}
      pagination={toDataTablePagination(data?.meta)}
      onPageChange={setPage}
      entityLabel={emptyLabel}
      footerLeft={
        isFetching && !isPending ? (
          <span className="text-xs text-slate-400">Updating…</span>
        ) : undefined
      }
    />
  )
}
