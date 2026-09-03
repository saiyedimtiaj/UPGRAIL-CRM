"use client"

import * as React from "react"
import { toast } from "sonner"

import { shortDate } from "@/lib/date"
import { useSettlements, useVoidSettlement } from "@/features/use-settlements"
import { useActiveSellers } from "@/features/use-sellers"
import { useMe } from "@/features/use-auth"
import { getErrorMessage } from "@/lib/handleError"
import { PAGE_SIZE, toDataTablePagination } from "@/lib/pagination"
import { SectionCard } from "@/components/primitives/section-card"
import { FilterBar, type FilterFieldDef } from "@/components/shared/filter-bar"
import { useUrlFilters } from "@/hooks/use-url-filters"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import DataTable, {
  type DataTableColumn,
} from "@/components/shared/data-table"
import { RowActions } from "@/components/shared/row-actions"
import { ConfirmDialog } from "@/components/primitives/confirm-dialog"
import { StatusBadge } from "@/components/primitives/status-badge"
import { Bdt, Usdt } from "@/components/primitives/money"
import type { USDTSettlement } from "@/lib/types"
import { EditSettlementModal } from "./edit-settlement-modal"


const EMPTY_FILTERS = {
  sellerId: undefined as number | undefined,
  paidBy: undefined as number | undefined,
  dateFrom: "",
  dateTo: "",
  status: "all",
  search: "",
}

export function SettlementsTable() {
  const [page, setPage] = React.useState(1)
  const { data: sellers = [] } = useActiveSellers()
  const { filters, setFilters, reset, isDirty } = useUrlFilters(EMPTY_FILTERS)
  const debouncedSearch = useDebouncedValue(filters.search)

  const query = {
    sellerId: filters.sellerId,
    paidBy: filters.paidBy,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    search: debouncedSearch || undefined,
    ...(filters.status === "all"
      ? {}
      : { voided: filters.status === "voided" }),
  }

  // Any filter change makes the current page number meaningless.
  const filterKey = JSON.stringify(query)
  const [seenKey, setSeenKey] = React.useState(filterKey)
  if (seenKey !== filterKey) {
    setSeenKey(filterKey)
    if (page !== 1) setPage(1)
  }

  const { data, isPending } = useSettlements({
    page,
    limit: PAGE_SIZE,
    ...query,
  })

  const sellerOptions = [
    { value: 0, label: "All Sellers" },
    ...sellers.map((s) => ({ value: s.id, label: s.name })),
  ]

  const filterFields: FilterFieldDef[] = [
    {
      kind: "search",
      key: "search",
      label: "Search",
      placeholder: "Search by payer, seller, or note…",
    },
    {
      kind: "searchable",
      key: "sellerId",
      label: "Seller Settled",
      options: sellerOptions,
      placeholder: "All Sellers",
    },
    {
      kind: "searchable",
      key: "paidBy",
      label: "Paid By",
      options: sellerOptions,
      placeholder: "Anyone",
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
  const { data: me } = useMe()
  const voidSettlement = useVoidSettlement()
  const settlements = data?.data ?? []
  const [editTarget, setEditTarget] = React.useState<USDTSettlement | null>(
    null
  )
  const [voidTarget, setVoidTarget] = React.useState<USDTSettlement | null>(
    null
  )

  const canManage = me?.role.name === "OWNER" || me?.role.name === "PARTNER"

  const columns: DataTableColumn<USDTSettlement>[] = [
    {
      key: "date",
      header: "Date / ID",
      cell: (s) => (
        <div>
          <div className="font-semibold text-slate-700">
            {shortDate(s.date)}
          </div>
          <div className="font-mono text-[10px] text-slate-400">{s.id}</div>
        </div>
      ),
    },
    {
      key: "seller",
      header: "External Seller",
      cell: (s) => {
        const seller = s.seller ?? sellers.find((x) => x.id === s.seller_id)
        return seller ? `${seller.flag} ${seller.name}` : String(s.seller_id)
      },
    },
    {
      key: "usdt",
      header: "USDT Amount",
      cell: (s) => <Usdt value={s.usdt_amount} />,
    },
    { key: "paid_by", header: "Fronted By", cell: (s) => s.paid_by_name },
    {
      key: "rate",
      header: "USDT Rate",
      cell: (s) => <Bdt value={s.usdt_rate} />,
      hideBelow: "lg",
    },
    {
      key: "bdt",
      header: "BDT Equivalent (Nazmul Payable)",
      cell: (s) => <Bdt value={s.bdt_equivalent} />,
      hideBelow: "lg",
    },
    {
      key: "allocations",
      header: "Trades Covered",
      cell: (s) => (s.allocations?.length ? s.allocations.length : "—"),
      hideBelow: "lg",
    },
    {
      key: "status",
      header: "Status",
      cell: (s) => <StatusBadge status={s.voided ? "voided" : "finalized"} />,
    },
    {
      key: "note",
      header: "Note",
      cell: (s) => <span className="text-slate-500">{s.note ?? "—"}</span>,
      hideBelow: "xl",
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (s) => (
        <RowActions
          disabled={!canManage || s.voided}
          onEdit={() => setEditTarget(s)}
          extraActions={[
            {
              label: "Void Settlement",
              onSelect: () => setVoidTarget(s),
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

      <SectionCard title="Historical USDT Settlement Logs">
        <DataTable
          columns={columns}
          data={settlements}
          rowKey={(s) => s.id}
          entityLabel="settlements"
          isLoading={isPending}
          pagination={toDataTablePagination(data?.meta)}
          onPageChange={setPage}
        />
      </SectionCard>

      <EditSettlementModal
        open={editTarget !== null}
        onOpenChange={(open) => !open && setEditTarget(null)}
        settlement={editTarget}
      />

      <ConfirmDialog
        open={voidTarget !== null}
        onOpenChange={(open) => !open && setVoidTarget(null)}
        title="Void Settlement"
        description="Settlements are never deleted — this reverses the allocation, un-settling the covered trades, and requires a reason for the audit trail (spec §17.2)."
        requireReason
        reasonLabel="Reason for voiding"
        destructive
        confirmLabel="Void Settlement"
        onConfirm={async (reason) => {
          if (!voidTarget || !reason) return
          try {
            const result = await voidSettlement.mutateAsync({ id: voidTarget.id, reason })
            toast.success(
              `Settlement ${voidTarget.id} voided (${result.reversedAllocations} allocation(s) reversed).`
            )
          } catch (error) {
            toast.error(getErrorMessage(error, "Failed to void settlement."))
          } finally {
            setVoidTarget(null)
          }
        }}
      />
    </>
  )
}
