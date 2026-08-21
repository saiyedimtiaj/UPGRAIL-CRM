"use client"

import * as React from "react"
import { toast } from "sonner"
import { Plus } from "lucide-react"

import { usePayments, useDeletePayment } from "@/features/use-payments"
import { useActiveClients } from "@/features/use-clients"
import { useActiveSellers } from "@/features/use-sellers"
import { useMe } from "@/features/use-auth"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { getErrorMessage } from "@/lib/handleError"
import { shortDate } from "@/lib/date"
import { PAGE_SIZE, toDataTablePagination } from "@/lib/pagination"
import { SectionCard } from "@/components/primitives/section-card"
import DataTable, {
  type DataTableColumn,
} from "@/components/shared/data-table"
import { RowActions } from "@/components/shared/row-actions"
import { ConfirmDialog } from "@/components/primitives/confirm-dialog"
import { Button } from "@/components/ui/button"
import { BdtSigned } from "@/components/primitives/money"
import { LogPaymentModal } from "@/components/shared/log-payment-modal"
import type { Payment } from "@/lib/types"
import {
  PaymentsFilters,
  type PaymentsFiltersState,
} from "./payments-filters"

const EMPTY_FILTERS: PaymentsFiltersState = {
  search: "",
  dateFrom: "",
  dateTo: "",
  partyType: "all",
  direction: "all",
}

export function PaymentsTable() {
  const [page, setPage] = React.useState(1)
  const [filters, setFilters] = React.useState<PaymentsFiltersState>(EMPTY_FILTERS)
  const debouncedSearch = useDebouncedValue(filters.search)

  const { data, isPending, isFetching } = usePayments({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    partyType: filters.partyType === "all" ? undefined : filters.partyType,
    direction: filters.direction === "all" ? undefined : filters.direction,
  })
  const { data: clients = [] } = useActiveClients()
  const { data: sellers = [] } = useActiveSellers()
  const { data: me } = useMe()
  const deletePayment = useDeletePayment()

  const payments = data?.data ?? []

  const [addOpen, setAddOpen] = React.useState(false)
  const [editTarget, setEditTarget] = React.useState<Payment | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<Payment | null>(null)

  const canManage = me?.role.name === "OWNER" || me?.role.name === "PARTNER"

  function handleFiltersChange(next: PaymentsFiltersState) {
    setFilters(next)
    setPage(1)
  }

  const partyName = (p: Payment) =>
    p.party_type === "CLIENT"
      ? (clients.find((c) => c.id === p.party_id)?.name ?? String(p.party_id))
      : (sellers.find((s) => s.id === p.party_id)?.name ?? String(p.party_id))

  const sorted = [...payments].sort((a, b) => (a.date < b.date ? 1 : -1))

  const columns: DataTableColumn<Payment>[] = [
    {
      key: "date",
      header: "Date / ID",
      cell: (p) => (
        <div>
          <div className="font-semibold text-slate-700">{shortDate(p.date)}</div>
          <div className="font-mono text-[10px] text-slate-400">{p.id}</div>
        </div>
      ),
    },
    {
      key: "party",
      header: "Party",
      cell: (p) => (
        <div>
          <div className="font-semibold text-slate-800">{partyName(p)}</div>
          <div className="text-[10px] text-slate-400">
            {p.party_type === "CLIENT" ? "Client" : "Direct Seller"}
          </div>
        </div>
      ),
    },
    {
      key: "direction",
      header: "Direction",
      cell: (p) => (
        <span
          className={
            p.direction === "IN"
              ? "inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-emerald-700"
              : "inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-blue-700"
          }
        >
          {p.direction}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      cell: (p) => (
        <BdtSigned
          value={p.direction === "IN" ? -p.amount : p.amount}
          className="font-semibold"
        />
      ),
    },
    {
      key: "method",
      header: "Method",
      cell: (p) => <span className="text-slate-600">{p.method ?? "—"}</span>,
      hideBelow: "lg",
    },
    {
      key: "note",
      header: "Note",
      cell: (p) => <span className="text-slate-500">{p.note ?? "—"}</span>,
      hideBelow: "xl",
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (p) => (
        <RowActions
          disabled={!canManage}
          onEdit={() => setEditTarget(p)}
          onDelete={() => setDeleteTarget(p)}
        />
      ),
    },
  ]

  return (
    <>
      <SectionCard
        title="Payment Log"
        subtitle={`${data?.meta.totalCount ?? 0} payment(s) across all clients and direct sellers`}
        action={
          canManage ? (
            <Button size="sm" onClick={() => setAddOpen(true)} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Log Payment
            </Button>
          ) : undefined
        }
      >
        <div className="mb-4">
          <PaymentsFilters value={filters} onChange={handleFiltersChange} />
        </div>
        <div className={isFetching && !isPending ? "opacity-60 transition-opacity" : undefined}>
          <DataTable
            columns={columns}
            data={sorted}
            rowKey={(p) => p.id}
            entityLabel="payments"
            isLoading={isPending}
            pagination={toDataTablePagination(data?.meta)}
            onPageChange={setPage}
          />
        </div>
      </SectionCard>

      <LogPaymentModal open={addOpen} onOpenChange={setAddOpen} mode="create" />

      <LogPaymentModal
        open={editTarget !== null}
        onOpenChange={(open) => !open && setEditTarget(null)}
        mode="edit"
        initial={editTarget ?? undefined}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Payment"
        description={`Permanently remove this payment for ${deleteTarget ? partyName(deleteTarget) : "this party"}? This cannot be undone.`}
        destructive
        confirmLabel="Delete"
        onConfirm={async () => {
          if (!deleteTarget) return
          try {
            await deletePayment.mutateAsync(deleteTarget.id)
            toast.success("Payment deleted.")
          } catch (error) {
            toast.error(getErrorMessage(error, "Failed to delete payment."))
          } finally {
            setDeleteTarget(null)
          }
        }}
      />
    </>
  )
}
