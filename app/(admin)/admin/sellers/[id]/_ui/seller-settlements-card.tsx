"use client"

import * as React from "react"
import { toast } from "sonner"

import { useSettlements, useVoidSettlement } from "@/features/use-settlements"
import { getErrorMessage } from "@/lib/handleError"
import { shortDate } from "@/lib/date"
import { PAGE_SIZE, toDataTablePagination } from "@/lib/pagination"
import { SectionCard } from "@/components/primitives/section-card"
import DataTable, {
  type DataTableColumn,
} from "@/components/shared/data-table"
import { RowActions } from "@/components/shared/row-actions"
import { ConfirmDialog } from "@/components/primitives/confirm-dialog"
import { StatusBadge } from "@/components/primitives/status-badge"
import { Bdt, Usdt } from "@/components/primitives/money"
import type { USDTSettlement } from "@/lib/types"

export function SellerSettlementsCard({
  sellerId,
  canManage,
}: {
  sellerId: number
  canManage: boolean
}) {
  const [page, setPage] = React.useState(1)
  const { data, isPending, isFetching } = useSettlements({
    sellerId,
    page,
    limit: PAGE_SIZE,
  })
  const voidSettlement = useVoidSettlement()

  const settlements = data?.data ?? []
  const [voidTarget, setVoidTarget] = React.useState<USDTSettlement | null>(null)

  const columns: DataTableColumn<USDTSettlement>[] = [
    {
      key: "date",
      header: "Date / ID",
      cell: (s) => (
        <div>
          <div className="font-semibold text-slate-700">{shortDate(s.date)}</div>
          <div className="font-mono text-[10px] text-slate-400">{s.id}</div>
        </div>
      ),
    },
    { key: "usdt", header: "USDT Amount", cell: (s) => <Usdt value={s.usdt_amount} /> },
    { key: "rate", header: "USDT Rate", cell: (s) => <Bdt value={s.usdt_rate} />, hideBelow: "lg" },
    { key: "bdt", header: "BDT Equivalent", cell: (s) => <Bdt value={s.bdt_equivalent} />, hideBelow: "lg" },
    {
      key: "allocations",
      header: "Trades Covered",
      cell: (s) => (
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
          {s.allocations?.length ?? 0} trade(s)
        </span>
      ),
    },
    { key: "paid_by", header: "Fronted By", cell: (s) => s.paid_by_name, hideBelow: "lg" },
    { key: "note", header: "Note", cell: (s) => <span className="text-slate-500">{s.note ?? "—"}</span>, hideBelow: "xl" },
    { key: "status", header: "Status", cell: (s) => <StatusBadge status={s.voided ? "voided" : "finalized"} /> },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (s) => (
        <RowActions
          disabled={!canManage || s.voided}
          extraActions={[
            { label: "Void Settlement", onSelect: () => setVoidTarget(s), destructive: true },
          ]}
        />
      ),
    },
  ]

  return (
    <>
      <SectionCard
        title="USDT Settlements"
        subtitle={`${data?.meta.totalCount ?? 0} settlement(s) fronted to this seller`}
      >
        <div className={isFetching && !isPending ? "opacity-60 transition-opacity" : undefined}>
          <DataTable
            columns={columns}
            data={settlements}
            rowKey={(s) => s.id}
            entityLabel="settlements"
            isLoading={isPending}
            pagination={toDataTablePagination(data?.meta)}
            onPageChange={setPage}
            rowClassName={(s) => (s.voided ? "opacity-40 line-through" : "")}
          />
        </div>
      </SectionCard>

      <ConfirmDialog
        open={voidTarget !== null}
        onOpenChange={(open) => !open && setVoidTarget(null)}
        title="Void Settlement"
        description="Settlements are never deleted — this reverses the allocation, un-settling the covered trades, and requires a reason for the audit trail."
        requireReason
        reasonLabel="Reason for voiding"
        destructive
        confirmLabel="Void Settlement"
        onConfirm={async (reason) => {
          if (!voidTarget || !reason) return
          try {
            await voidSettlement.mutateAsync({ id: voidTarget.id, reason })
            toast.success("Settlement voided.")
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
