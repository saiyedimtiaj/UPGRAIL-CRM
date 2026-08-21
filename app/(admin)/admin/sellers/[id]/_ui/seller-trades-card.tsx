"use client"

import * as React from "react"

import { useTransactions } from "@/features/use-transactions"
import { timeOnly, shortDate } from "@/lib/date"
import { PAGE_SIZE, toDataTablePagination } from "@/lib/pagination"
import { SectionCard } from "@/components/primitives/section-card"
import DataTable, {
  type DataTableColumn,
} from "@/components/shared/data-table"
import { ProfitStatusBadge } from "@/components/primitives/profit-status-badge"
import { Usd, Usdt } from "@/components/primitives/money"
import { pct } from "@/lib/format"
import type { Transaction } from "@/lib/types"

export function SellerTradesCard({ sellerId }: { sellerId: number }) {
  const [page, setPage] = React.useState(1)
  const { data, isPending, isFetching } = useTransactions({
    sellerId,
    page,
    limit: PAGE_SIZE,
  })

  const trades = data?.data ?? []

  const columns: DataTableColumn<Transaction>[] = [
    {
      key: "trade",
      header: "Trade ID / Time",
      cell: (t) => (
        <div>
          <div className="font-mono text-[11px] font-bold text-slate-700">{t.id}</div>
          <div className="text-[10px] text-slate-400">{timeOnly(t.created_at)}</div>
        </div>
      ),
    },
    { key: "date", header: "Date", cell: (t) => shortDate(t.date), hideBelow: "md" },
    {
      key: "client",
      header: "Client",
      cell: (t) => (t.client ? t.client.name : `#${t.client_id}`),
      hideBelow: "md",
    },
    { key: "usd", header: "USD Amount", cell: (t) => <Usd value={t.usd_amount} /> },
    { key: "card_rate", header: "Card Rate", cell: (t) => pct(t.card_rate), hideBelow: "lg" },
    {
      key: "settled",
      header: "Settled",
      cell: (t) => {
        const ratio =
          t.seller_usdt_entitlement > 0
            ? Math.min(1, t.settled_usdt / t.seller_usdt_entitlement)
            : 0
        return (
          <div className="min-w-24">
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <Usdt value={t.settled_usdt} className="font-semibold" />
              <span className="text-slate-400">/ {t.seller_usdt_entitlement.toLocaleString()}</span>
            </div>
            <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-zinc-200">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${ratio * 100}%` }}
              />
            </div>
          </div>
        )
      },
    },
    {
      key: "status",
      header: "Profit Status",
      cell: (t) => <ProfitStatusBadge status={t.voided ? "VOIDED" : t.profit_status} />,
      hideBelow: "sm",
    },
  ]

  return (
    <SectionCard
      title="Trades Supplied"
      subtitle={`${data?.meta.totalCount ?? 0} trade(s) sourced through this seller`}
    >
      <div className={isFetching && !isPending ? "opacity-60 transition-opacity" : undefined}>
        <DataTable
          columns={columns}
          data={trades}
          rowKey={(t) => t.id}
          entityLabel="trades"
          isLoading={isPending}
          pagination={toDataTablePagination(data?.meta)}
          onPageChange={setPage}
          rowClassName={(t) => (t.voided ? "opacity-40 line-through" : "")}
        />
      </div>
    </SectionCard>
  )
}
