"use client"

import * as React from "react"
import { toast } from "sonner"

import { shortDate } from "@/lib/date"
import { useTransfers, useVoidTransfer } from "@/features/use-transfers"
import { useMe } from "@/features/use-auth"
import { getErrorMessage } from "@/lib/handleError"
import { PAGE_SIZE, toDataTablePagination } from "@/lib/pagination"
import { SectionCard } from "@/components/primitives/section-card"
import DataTable, {
  type DataTableColumn,
} from "@/components/shared/data-table"
import { RowActions } from "@/components/shared/row-actions"
import { ConfirmDialog } from "@/components/primitives/confirm-dialog"
import { StatusBadge } from "@/components/primitives/status-badge"
import { Bdt } from "@/components/primitives/money"
import type { MoneyTransfer } from "@/lib/types"

const DESTINATION_LABEL: Record<string, string> = {
  NAZMUL: "Nazmul",
  UPGRAIL_BANK: "UpGrail Bank",
  PROFIT_BANK: "Profit Bank",
}

export function TransfersTable() {
  const [page, setPage] = React.useState(1)
  const { data, isPending } = useTransfers({ page, limit: PAGE_SIZE })
  const { data: me } = useMe()
  const voidTransfer = useVoidTransfer()
  const transfers = data?.data ?? []
  const [voidTarget, setVoidTarget] = React.useState<MoneyTransfer | null>(null)

  const canManage = me?.role.name === "OWNER" || me?.role.name === "PARTNER"

  const columns: DataTableColumn<MoneyTransfer>[] = [
    {
      key: "date",
      header: "Date / ID",
      cell: (t) => (
        <div>
          <div className="font-semibold text-slate-700">{shortDate(t.created_at)}</div>
          <div className="font-mono text-[10px] text-slate-400">{t.id}</div>
        </div>
      ),
    },
    {
      key: "route",
      header: "Route",
      cell: (t) => (
        <span className="font-semibold text-slate-700">
          {DESTINATION_LABEL[t.from_destination]} → {DESTINATION_LABEL[t.to_destination]}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      cell: (t) => <Bdt value={t.amount_bdt} className="font-bold" />,
    },
    {
      key: "reference",
      header: "Reference",
      cell: (t) => <span className="text-slate-500">{t.reference ?? "—"}</span>,
      hideBelow: "lg",
    },
    {
      key: "note",
      header: "Note",
      cell: (t) => <span className="text-slate-500">{t.note ?? "—"}</span>,
      hideBelow: "xl",
    },
    {
      key: "status",
      header: "Status",
      cell: (t) => <StatusBadge status={t.voided ? "voided" : "finalized"} />,
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
      <SectionCard title="Transfer History">
        <DataTable
          columns={columns}
          data={transfers}
          rowKey={(t) => t.id}
          entityLabel="transfers"
          isLoading={isPending}
          pagination={toDataTablePagination(data?.meta)}
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
