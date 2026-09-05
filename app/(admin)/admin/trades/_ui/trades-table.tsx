"use client"

import * as React from "react"
import { toast } from "sonner"

import { useTransactions, useVoidTransaction, useDeleteTransaction } from "@/features/use-transactions"
import { useActiveClients } from "@/features/use-clients"
import { useActiveSellers } from "@/features/use-sellers"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { getErrorMessage } from "@/lib/handleError"
import { timeOnly } from "@/lib/date"
import { PAGE_SIZE, toDataTablePagination } from "@/lib/pagination"
import { SectionCard } from "@/components/primitives/section-card"
import DataTable, {
  type DataTableColumn,
} from "@/components/shared/data-table"
import { RowActions } from "@/components/shared/row-actions"
import { ProfitStatusBadge } from "@/components/primitives/profit-status-badge"
import { Bdt, Usd, Usdt } from "@/components/primitives/money"
import { ConfirmDialog } from "@/components/primitives/confirm-dialog"
import type { Transaction } from "@/lib/types"
import { usePermissions } from "@/hooks/use-permission"
import { EditTransactionModal } from "./edit-transaction-modal"
import {
  TradesFilters,
  type TradesFiltersState,
} from "./trades-filters"

const EMPTY_FILTERS: TradesFiltersState = {
  search: "",
  dateFrom: "",
  dateTo: "",
  clientId: "all",
  sellerId: "all",
  profitStatus: "all",
  voided: "all",
}


export function TradesTable() {
  const [page, setPage] = React.useState(1)
  const [filters, setFilters] = React.useState<TradesFiltersState>(EMPTY_FILTERS)
  const debouncedSearch = useDebouncedValue(filters.search)

  const { data: txData, isPending, isFetching } = useTransactions({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    clientId: filters.clientId === "all" ? undefined : filters.clientId,
    sellerId: filters.sellerId === "all" ? undefined : filters.sellerId,
    profitStatus: filters.profitStatus === "all" ? undefined : filters.profitStatus,
    voided: filters.voided === "all" ? undefined : filters.voided === "true",
  })
  const { data: clients = [] } = useActiveClients()
  const { data: sellers = [] } = useActiveSellers()
  const voidTransaction = useVoidTransaction()
  const deleteTransaction = useDeleteTransaction()
  const [voidTarget, setVoidTarget] = React.useState<Transaction | null>(null)
  const [editTarget, setEditTarget] = React.useState<Transaction | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<Transaction | null>(
    null
  )

  const { can } = usePermissions()
  const canManage = can("trades.edit")
  const trades = txData?.data ?? []

  function handleFiltersChange(next: TradesFiltersState) {
    setFilters(next)
    setPage(1)
  }

  const columns: DataTableColumn<Transaction>[] = [
    {
      key: "trade",
      header: "Trade ID / Time",
      cell: (t) => (
        <div>
          <div className="font-mono text-[11px] font-bold text-slate-700">
            {t.id}
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
      cell: (t) =>
        t.client?.name ??
        clients.find((c) => c.id === t.client_id)?.name ??
        String(t.client_id),
    },
    {
      key: "seller",
      header: "Seller / Sourcing",
      cell: (t) => {
        const seller = t.seller ?? sellers.find((s) => s.id === t.seller_id)
        return seller ? `${seller.flag} ${seller.name}` : String(t.seller_id)
      },
      hideBelow: "md",
    },
    {
      key: "usd",
      header: "USD Amount",
      cell: (t) => <Usd value={t.usd_amount} />,
    },
    {
      key: "card_rate",
      header: "Card Rate",
      cell: (t) => `${t.card_rate}%`,
      hideBelow: "lg",
    },
    {
      key: "entitlement",
      header: "Seller USDT",
      cell: (t) => <Usdt value={t.seller_usdt_entitlement} />,
      hideBelow: "lg",
    },
    {
      key: "client_charge",
      header: "Client Charge",
      cell: (t) =>
        t.client_charge_status === "POSTED" ? (
          <Bdt value={t.sell_bdt} />
        ) : (
          <span className="text-slate-400">Awaiting rate</span>
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
      header: "Profit Status",
      cell: (t) => <ProfitStatusBadge status={t.voided ? "VOIDED" : t.profit_status} />,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (t) => {
        if (!canManage || t.voided) return null
        return (
          <RowActions
            onEdit={() => setEditTarget(t)}
            extraActions={[
              {
                label: "Void Trade",
                onSelect: () => setVoidTarget(t),
                destructive: true,
              },
              ...(t.settled_usdt === 0
                ? [
                    {
                      label: "Delete (no settlement activity)",
                      onSelect: () => setDeleteTarget(t),
                      destructive: true,
                    },
                  ]
                : []),
            ]}
          />
        )
      },
    },
  ]

  return (
    <>
      <SectionCard
        title="Transactions Ledger"
        subtitle={`${txData?.meta.totalCount ?? 0} trade(s) match the current filters`}
      >
        <div className="mb-4">
          <TradesFilters
            value={filters}
            onChange={handleFiltersChange}
            clients={clients}
            sellers={sellers}
          />
        </div>
        <div className={isFetching && !isPending ? "opacity-60 transition-opacity" : undefined}>
          <DataTable
            columns={columns}
            data={trades}
            rowKey={(t) => t.id}
            entityLabel="trades"
            isLoading={isPending}
            pagination={toDataTablePagination(txData?.meta)}
            onPageChange={setPage}
            rowClassName={(t) => (t.voided ? "opacity-40 line-through" : "")}
          />
        </div>
      </SectionCard>

      <EditTransactionModal
        open={editTarget !== null}
        onOpenChange={(open) => !open && setEditTarget(null)}
        transaction={editTarget}
      />

      <ConfirmDialog
        open={voidTarget !== null}
        onOpenChange={(open) => !open && setVoidTarget(null)}
        title="Void Transaction"
        description="Finalized transactions are never deleted — this marks the trade as voided and requires a reason for the audit trail."
        requireReason
        reasonLabel="Reason for voiding"
        destructive
        confirmLabel="Void Trade"
        onConfirm={async (reason) => {
          if (!voidTarget || !reason) return
          try {
            await voidTransaction.mutateAsync({ id: voidTarget.id, reason })
            toast.success(`Trade ${voidTarget.id} voided.`)
          } catch (error) {
            toast.error(getErrorMessage(error, "Failed to void trade."))
          } finally {
            setVoidTarget(null)
          }
        }}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Pending Trade"
        description={`Permanently remove trade ${deleteTarget?.id ?? ""}? It has no committed profit yet, so this is safe — but cannot be undone.`}
        destructive
        confirmLabel="Delete"
        onConfirm={async () => {
          if (!deleteTarget) return
          try {
            await deleteTransaction.mutateAsync(deleteTarget.id)
            toast.success(`Trade ${deleteTarget.id} deleted.`)
          } catch (error) {
            toast.error(getErrorMessage(error, "Failed to delete trade."))
          } finally {
            setDeleteTarget(null)
          }
        }}
      />
    </>
  )
}
