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
import { BdtSigned } from "@/components/primitives/money"
import type { MoneyTransfer } from "@/lib/types"

const DESTINATION_LABEL: Record<string, string> = {
  NAZMUL: "Nazmul",
  UPGRAIL_BANK: "UpGrail Bank",
  PROFIT_BANK: "Profit Bank",
}

export function WithdrawalHistory() {
  const [page, setPage] = React.useState(1)
  const { data, isPending } = useTransfers({ page, limit: PAGE_SIZE })
  const { data: me } = useMe()
  const voidTransfer = useVoidTransfer()
  const allTransfers = data?.data ?? []

  const transfers = allTransfers.filter(
    (t) => t.from_destination === "PROFIT_BANK" || t.to_destination === "PROFIT_BANK"
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
      <SectionCard title="Profit Bank History">
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
