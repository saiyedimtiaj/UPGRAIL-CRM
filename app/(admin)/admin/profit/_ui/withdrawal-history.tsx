"use client"

import * as React from "react"
import { toast } from "sonner"

import { shortDate } from "@/lib/date"
import { useTransfers, useVoidTransfer } from "@/features/use-transfers"
import { useMe } from "@/features/use-auth"
import { getErrorMessage } from "@/lib/handleError"
import { PAGE_SIZE } from "@/lib/pagination"
import { SectionCard } from "@/components/primitives/section-card"
import { FilterBar, type FilterFieldDef } from "@/components/shared/filter-bar"
import { useUrlFilters } from "@/hooks/use-url-filters"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import DataTable, {
  type DataTableColumn,
} from "@/components/shared/data-table"
import { RowActions } from "@/components/shared/row-actions"
import { ConfirmDialog } from "@/components/primitives/confirm-dialog"
import { BdtSigned } from "@/components/primitives/money"
import type { MoneyTransfer } from "@/lib/types"

const DESTINATION_LABEL: Record<string, string> = {
  NAZMUL: "Nazmul",
  UPGRAIL_BANK: "UpGrail Bank",
  PROFIT_BANK: "Profit Bank",
}

const EMPTY_FILTERS = {
  direction: "all",
  status: "all",
  dateFrom: "",
  dateTo: "",
  search: "",
}

export function WithdrawalHistory() {
  const [page, setPage] = React.useState(1)
  const { filters, setFilters, reset, isDirty } = useUrlFilters(EMPTY_FILTERS)
  const debouncedSearch = useDebouncedValue(filters.search)

  // Everything except the Profit Bank match is narrowed server-side. That one
  // stays here because it is an OR across two columns ("either end is the
  // Profit Bank"), which the list endpoint does not express.
  const query = {
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    search: debouncedSearch || undefined,
    ...(filters.status === "all"
      ? {}
      : { voided: filters.status === "voided" }),
    ...(filters.direction === "in"
      ? { toDestination: "PROFIT_BANK" as const }
      : filters.direction === "out"
        ? { fromDestination: "PROFIT_BANK" as const }
        : {}),
  }

  // Any filter change makes the current page number meaningless.
  const filterKey = JSON.stringify(query)
  const [seenKey, setSeenKey] = React.useState(filterKey)
  if (seenKey !== filterKey) {
    setSeenKey(filterKey)
    if (page !== 1) setPage(1)
  }

  // Profit Bank rows used to be filtered out of an already-paginated page,
  // so "showing 1-25 of 60" could sit above three visible rows. Fetch the
  // set, filter, then paginate what is left, so the two agree.
  const { data, isPending } = useTransfers({ page: 1, limit: 500, ...query })
  const { data: me } = useMe()
  const voidTransfer = useVoidTransfer()

  const profitBankTransfers = (data?.data ?? []).filter(
    (t) =>
      t.from_destination === "PROFIT_BANK" || t.to_destination === "PROFIT_BANK"
  )

  const filterFields: FilterFieldDef[] = [
    {
      kind: "search",
      key: "search",
      label: "Search",
      placeholder: "Search by reference, note, or reason…",
    },
    {
      kind: "select",
      key: "direction",
      label: "Direction",
      options: [
        { value: "all", label: "All movement" },
        { value: "in", label: "Into Profit Bank" },
        { value: "out", label: "Out of Profit Bank" },
      ],
    },
    {
      kind: "select",
      key: "status",
      label: "Status",
      options: [
        { value: "all", label: "All" },
        { value: "active", label: "Active" },
        { value: "voided", label: "Voided" },
      ],
    },
    { kind: "date", key: "dateFrom", label: "Date From" },
    { kind: "date", key: "dateTo", label: "Date To" },
  ]
  const totalCount = profitBankTransfers.length
  const transfers = profitBankTransfers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  )
  const [voidTarget, setVoidTarget] = React.useState<MoneyTransfer | null>(null)

  const canManage = me?.role.name === "OWNER" || me?.role.name === "PARTNER"

  const columns: DataTableColumn<MoneyTransfer>[] = [
    {
      key: "note",
      header: "Transfer",
      cell: (t) => (
        <div>
          <div className="text-sm font-bold text-slate-900">
            {DESTINATION_LABEL[t.from_destination]} → {DESTINATION_LABEL[t.to_destination]}
          </div>
          <div className="text-[11px] text-slate-400">
            {shortDate(t.created_at)} {t.note ? `• ${t.note}` : ""}
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      cell: (t) => (
        <BdtSigned
          value={t.to_destination === "PROFIT_BANK" ? -t.amount_bdt : t.amount_bdt}
          className="text-sm font-bold"
        />
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (t) => (
        <RowActions
          disabled={!canManage || t.voided}
          extraActions={[
            {
              label: "Void Transfer",
              onSelect: () => setVoidTarget(t),
              destructive: true,
            },
          ]}
        />
      ),
    },
  ]

  return (
    <>
      <SectionCard className="mb-5">
        <FilterBar
          fields={filterFields}
          value={filters}
          onChange={setFilters}
          onReset={reset}
          isDirty={isDirty}
        />
      </SectionCard>

      <SectionCard title="Profit Bank History">
        <DataTable
          columns={columns}
          data={transfers}
          rowKey={(t) => t.id}
          entityLabel="transfers"
          isLoading={isPending}
          pagination={{
            page,
            totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
            total: totalCount,
            limit: PAGE_SIZE,
          }}
          onPageChange={setPage}
          rowClassName={(t) => (t.voided ? "opacity-40 line-through" : "")}
        />
      </SectionCard>

      <ConfirmDialog
        open={voidTarget !== null}
        onOpenChange={(open) => !open && setVoidTarget(null)}
        title="Void Transfer"
        description="Reverses this transfer's ledger effect and requires a reason for the audit trail."
        requireReason
        reasonLabel="Reason for voiding"
        destructive
        confirmLabel="Void Transfer"
        onConfirm={async (reason) => {
          if (!voidTarget || !reason) return
          try {
            await voidTransfer.mutateAsync({ id: voidTarget.id, reason })
            toast.success("Transfer voided.")
          } catch (error) {
            toast.error(getErrorMessage(error, "Failed to void transfer."))
          } finally {
            setVoidTarget(null)
          }
        }}
      />
    </>
  )
}
