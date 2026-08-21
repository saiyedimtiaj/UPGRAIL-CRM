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
import { Bdt, Usd } from "@/components/primitives/money"
import type { Transaction } from "@/lib/types"

export function ClientTradesCard({ clientId }: { clientId: number }) {
  const [page, setPage] = React.useState(1)
  const { data, isPending, isFetching } = useTransactions({
    clientId,
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
      key: "seller",
      header: "Seller",
      cell: (t) => (t.seller ? `${t.seller.flag ?? ""} ${t.seller.name}` : `#${t.seller_id}`),
      hideBelow: "md",
    },
    { key: "usd", header: "USD Amount", cell: (t) => <Usd value={t.usd_amount} /> },
    {
      key: "client_charge",
      header: "Client Charge",
      align: "right",
      cell: (t) =>
        t.client_charge_status === "POSTED" ? (
          <Bdt value={t.sell_bdt} />
        ) : (
          <span className="text-slate-400">Awaiting rate</span>
        ),
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
      title="Trade History"
      subtitle={`${data?.meta.totalCount ?? 0} trade(s) with this client`}
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
