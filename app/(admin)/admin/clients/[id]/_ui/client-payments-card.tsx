"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { motion } from "motion/react"
import { ArrowDownLeft, ArrowUpRight, Coins } from "lucide-react"

import { staggerChild, staggerParent } from "@/lib/animations"
import { usePayments, useDeletePayment } from "@/features/use-payments"
import { getErrorMessage } from "@/lib/handleError"
import { PAGE_SIZE } from "@/lib/pagination"
import { SectionCard } from "@/components/primitives/section-card"
import { TimelineItem } from "@/components/primitives/timeline-item"
import { EmptyState } from "@/components/primitives/empty-state"
import { RowActions } from "@/components/shared/row-actions"
import { ConfirmDialog } from "@/components/primitives/confirm-dialog"
import { LogPaymentModal } from "@/components/shared/log-payment-modal"
import { shortDate } from "@/lib/date"
import type { Payment } from "@/lib/types"

// Only mounted once the parent has confirmed `clientId` is valid — see the
// same guard note in client-trades-card.tsx.
export function ClientPaymentsCard({
  clientId,
  canManage,
}: {
  clientId: number
  canManage: boolean
}) {
  const { data, isPending } = usePayments({
    partyType: "CLIENT",
    partyId: clientId,
    limit: PAGE_SIZE,
  })
  const deletePayment = useDeletePayment()

  const payments = data?.data ?? []
  const [editTarget, setEditTarget] = React.useState<Payment | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<Payment | null>(null)

  return (
    <>
      <SectionCard
        title="Payment History"
        subtitle={`${data?.meta.totalCount ?? 0} payment(s) logged`}
        action={
          (data?.meta.totalCount ?? 0) > payments.length ? (
            <Link
              href="/admin/client-ledger"
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
            >
              View all in Client Ledger →
            </Link>
          ) : undefined
        }
      >
        {isPending ? (
          <div className="space-y-3 py-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <EmptyState icon={Coins} title="No payments yet" description="Logged payments will appear here." />
        ) : (
          <motion.div
            variants={staggerParent}
            initial="hidden"
            animate="show"
            className="divide-y divide-slate-100"
          >
            {payments.map((p) => (
              <motion.div key={p.id} variants={staggerChild}>
                <TimelineItem
                  icon={p.direction === "IN" ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  iconTone={p.direction === "IN" ? "emerald" : "rose"}
                  title={p.direction === "IN" ? "Payment Received" : "Payment Reversed"}
                  subtitle={`${p.method ?? "Bank Transfer"} • ${shortDate(p.date)} • ${p.destination}`}
                  amount={p.amount}
                  direction={p.direction === "IN" ? "in" : "out"}
                  actions={
                    <RowActions
                      disabled={!canManage}
                      onEdit={() => setEditTarget(p)}
                      onDelete={() => setDeleteTarget(p)}
                    />
                  }
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </SectionCard>

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
        description="Permanently remove this payment? This cannot be undone."
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
