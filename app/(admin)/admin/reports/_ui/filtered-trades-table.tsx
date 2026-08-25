"use client"

import { useActiveClients } from "@/features/use-clients"
import { useActiveSellers } from "@/features/use-sellers"
import { shortDate } from "@/lib/date"
import { SectionCard } from "@/components/primitives/section-card"
import DataTable, {
  type DataTableColumn,
} from "@/components/shared/data-table"
import { ProfitStatusBadge } from "@/components/primitives/profit-status-badge"
import { Bdt, Usd, Usdt } from "@/components/primitives/money"
import type { Transaction } from "@/lib/types"

export function FilteredTradesTable({
  trades,
  isLoading,
}: {
  trades: Transaction[]
  isLoading?: boolean
}) {
  const { data: clients = [] } = useActiveClients()
  const { data: sellers = [] } = useActiveSellers()

  const columns: DataTableColumn<Transaction>[] = [
    { key: "date", header: "Date", cell: (t) => shortDate(t.date) },
    {
      key: "client",
      header: "Client",
      cell: (t) =>
        t.client?.name ??
        clients.find((c) => c.id === t.client_id)?.name ??
        String(t.client_id),
    },
    {
      key: "usd",
      header: "USD Volume",
      cell: (t) => <Usd value={t.usd_amount} />,
    },
    {
      key: "sell_rate",
      header: "Client Rate",
      cell: (t) => (t.client_rate ? <Bdt value={t.client_rate} /> : "—"),
    },
    {
      key: "total_sell",
      header: "Client Charge (BDT)",
      cell: (t) => <Bdt value={t.sell_bdt} />,
    },
    {
      key: "seller",
      header: "Sourcing Desk",
      cell: (t) => {
        const seller = t.seller ?? sellers.find((s) => s.id === t.seller_id)
        return seller ? `${seller.flag} ${seller.name}` : String(t.seller_id)
      },
    },
    {
      key: "buy_cost",
      header: "Actual Buy Cost",
      cell: (t) =>
        t.actual_buy_bdt !== undefined ? (
          <Bdt value={t.actual_buy_bdt} />
        ) : (
          <span className="text-slate-400">
            {t.settled_usdt > 0 ? `${t.settled_usdt} / ` : ""}
            <Usdt value={t.seller_usdt_entitlement} /> pending
          </span>
        ),
    },
    {
      key: "profit",
      header: "Profit (BDT)",
      cell: (t) =>
        t.profit !== undefined ? (
          <Bdt value={t.profit} className="font-bold text-emerald-700" />
        ) : (
          "—"
        ),
    },
    {
      key: "status",
      header: "Status",
      cell: (t) => <ProfitStatusBadge status={t.voided ? "VOIDED" : t.profit_status} />,
    },
  ]

  return (
    <SectionCard
      title="Filtered Trades Snapshot"
      subtitle={`${trades.length} trade(s) match the current filters`}
    >
      <DataTable
        columns={columns}
        data={trades}
        rowKey={(t) => t.id}
        entityLabel="trades"
        isLoading={isLoading}
        rowClassName={(t) => (t.voided ? "opacity-40 line-through" : "")}
      />
    </SectionCard>
  )
}
