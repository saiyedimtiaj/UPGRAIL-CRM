"use client"

import * as React from "react"
import { toast } from "sonner"

import { useRateHistory, useDeleteRate } from "@/features/use-rates"
import { useActiveClients } from "@/features/use-clients"
import { useActiveSellers } from "@/features/use-sellers"
import { useMe } from "@/features/use-auth"
import { getErrorMessage } from "@/lib/handleError"
import { shortDate, shortDateTime } from "@/lib/date"
import { PAGE_SIZE, toDataTablePagination } from "@/lib/pagination"
import { SectionCard } from "@/components/primitives/section-card"
import DataTable, {
  type DataTableColumn,
} from "@/components/shared/data-table"
import { RowActions } from "@/components/shared/row-actions"
import { ConfirmDialog } from "@/components/primitives/confirm-dialog"
import { Bdt } from "@/components/primitives/money"
import type { DailyRate } from "@/lib/types"
import { EditRateModal } from "./edit-rate-modal"
import {
  RateHistoryFilters,
  type RateHistoryFiltersState,
} from "./rate-history-filters"

const EMPTY_FILTERS: RateHistoryFiltersState = {
  dateFrom: "",
  dateTo: "",
  partyType: "all",
  kind: "all",
}

export function RateHistoryTable() {
  const [page, setPage] = React.useState(1)
  const [filters, setFilters] = React.useState<RateHistoryFiltersState>(EMPTY_FILTERS)

  const { data, isPending, isFetching } = useRateHistory({
    page,
    limit: PAGE_SIZE,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    partyType: filters.partyType === "all" ? undefined : filters.partyType,
    kind: filters.kind === "all" ? undefined : filters.kind,
  })
  const { data: clients = [] } = useActiveClients()
  const { data: sellers = [] } = useActiveSellers()
  const { data: me } = useMe()
  const deleteRate = useDeleteRate()
  const [editTarget, setEditTarget] = React.useState<DailyRate | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<DailyRate | null>(
    null
  )

  const canManage = me?.role.name === "OWNER" || me?.role.name === "PARTNER"
  const rates = data?.data ?? []

  function handleFiltersChange(next: RateHistoryFiltersState) {
    setFilters(next)
    setPage(1)
  }

  const partyName = (r: DailyRate) =>
    r.party_type === "CLIENT"
      ? (clients.find((c) => c.id === r.party_id)?.name ?? String(r.party_id))
      : (sellers.find((s) => s.id === r.party_id)?.name ?? String(r.party_id))

  const columns: DataTableColumn<DailyRate>[] = [
    {
      key: "date",
      header: "Date",
      cell: (r) => <span className="font-semibold text-slate-700">{shortDate(r.date)}</span>,
    },
    {
      key: "party",
      header: "Party",
      cell: (r) => (
        <div>
          <div className="font-semibold text-slate-800">{partyName(r)}</div>
          <div className="text-[10px] text-slate-400 capitalize">
            {r.party_type}
          </div>
        </div>
      ),
    },
    {
      key: "kind",
      header: "Kind",
      cell: (r) => (
        <span className="rounded-md border border-amber-200/60 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 uppercase">
          {r.kind}
        </span>
      ),
    },
    {
      key: "value",
      header: "Value",
      align: "right",
      cell: (r) =>
        r.kind === "CARD" ? (
          <span className="font-semibold text-slate-800">{r.value}%</span>
        ) : (
          <Bdt value={r.value} className="font-semibold" />
        ),
    },
    {
      key: "entered_at",
      header: "Entered",
      cell: (r) => (
        <span className="text-slate-500">{shortDateTime(r.entered_at)}</span>
      ),
      hideBelow: "lg",
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (r) => (
        <RowActions
          disabled={!canManage}
          onEdit={() => setEditTarget(r)}
          onDelete={() => setDeleteTarget(r)}
        />
      ),
    },
  ]

  return (
    <>
      <SectionCard
        title="Rate History"
        subtitle={`${data?.meta.totalCount ?? 0} rate(s) match the current filters`}
      >
        <div className="mb-4">
          <RateHistoryFilters value={filters} onChange={handleFiltersChange} />
        </div>
        <div className={isFetching && !isPending ? "opacity-60 transition-opacity" : undefined}>
          <DataTable
            columns={columns}
            data={rates}
            rowKey={(r) => r.id}
            entityLabel="rate entries"
            isLoading={isPending}
            pagination={toDataTablePagination(data?.meta)}
            onPageChange={setPage}
          />
        </div>
      </SectionCard>

      <EditRateModal
        open={editTarget !== null}
        onOpenChange={(open) => !open && setEditTarget(null)}
        rate={editTarget}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Rate"
        description={`Remove the ${deleteTarget?.kind.toUpperCase() ?? ""} rate for ${deleteTarget ? partyName(deleteTarget) : ""} on ${deleteTarget ? shortDate(deleteTarget.date) : ""}? Any trades that depended on it will revert to pending.`}
        destructive
        confirmLabel="Delete"
        onConfirm={async () => {
          if (!deleteTarget) return
          try {
            await deleteRate.mutateAsync(deleteTarget.id)
            toast.success("Rate deleted.")
          } catch (error) {
            toast.error(getErrorMessage(error, "Failed to delete rate."))
          } finally {
            setDeleteTarget(null)
          }
        }}
      />
    </>
  )
}
