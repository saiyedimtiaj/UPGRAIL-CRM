"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { motion } from "motion/react"
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Plus,
  Search,
} from "lucide-react"

import { staggerChild, staggerParent } from "@/lib/animations"
import { useActiveClients } from "@/features/use-clients"
import { useTransactions } from "@/features/use-transactions"
import { usePayments, useDeletePayment } from "@/features/use-payments"
import { useBalances } from "@/features/use-analytics"
import { useMe } from "@/features/use-auth"
import { getErrorMessage } from "@/lib/handleError"
import { SectionCard } from "@/components/primitives/section-card"
import { PartyListItem } from "@/components/primitives/party-list-item"
import { TimelineItem } from "@/components/primitives/timeline-item"
import { EmptyState } from "@/components/primitives/empty-state"
import { BalancePill } from "@/components/primitives/balance-pill"
import type { Status } from "@/components/primitives/status-badge"
import { RowActions } from "@/components/shared/row-actions"
import { ConfirmDialog } from "@/components/primitives/confirm-dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LogPaymentModal } from "@/components/shared/log-payment-modal"
import { AddClientModal } from "@/components/shared/add-client-modal"
import { Skeleton } from "@/components/ui/skeleton"
import type { ClientChargeStatus, Payment } from "@/lib/types"

const CHARGE_STATUS_TO_UI: Record<ClientChargeStatus, Status> = {
  AWAITING_CLIENT_RATE: "pending",
  POSTED: "finalized",
}

export function ClientLedger() {
  const { data: clients = [], isPending: clientsPending } = useActiveClients()
  const { data: txData } = useTransactions({ limit: 500 })
  const { data: paymentsData } = usePayments({ limit: 500 })
  const { data: balances } = useBalances()
  const { data: me } = useMe()
  const deletePayment = useDeletePayment()

  const transactions = txData?.data ?? []
  const payments = paymentsData?.data ?? []
  const clientBalances = balances?.clientDues ?? {}

  const [search, setSearch] = React.useState("")
  const [selectedId, setSelectedId] = React.useState<number | null>(
    clients[0]?.id ?? null
  )
  const [paymentOpen, setPaymentOpen] = React.useState(false)
  const [newClientOpen, setNewClientOpen] = React.useState(false)
  const [editPaymentTarget, setEditPaymentTarget] =
    React.useState<Payment | null>(null)
  const [deletePaymentTarget, setDeletePaymentTarget] =
    React.useState<Payment | null>(null)

  const canManage = me?.role.name === "OWNER" || me?.role.name === "PARTNER"

  const sortedClients = [...clients]
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (clientBalances[b.id] ?? 0) - (clientBalances[a.id] ?? 0))

  const selected =
    clients.find((c) => c.id === selectedId) ?? (clients[0] ?? null)

  const timeline = selected
    ? [
        ...transactions
          .filter((t) => t.client_id === selected.id && !t.voided)
          .map((t) => ({
            id: `t-${t.id}`,
            date: t.created_at,
            kind: "trade" as const,
            title: `Trade ${t.id}`,
            subtitle: `$${t.usd_amount.toLocaleString()} USD sourced`,
            amount: t.sell_bdt ?? 0,
            direction: "out" as const,
            status: CHARGE_STATUS_TO_UI[t.client_charge_status],
            payment: undefined as Payment | undefined,
          })),
        ...payments
          .filter(
            (p) => p.party_type === "CLIENT" && p.party_id === selected.id
          )
          .map((p) => ({
            id: `p-${p.id}`,
            date: p.created_at,
            kind: "payment" as const,
            title:
              p.direction === "IN" ? "Payment Received" : "Payment Reversed",
            subtitle: p.method ?? "Bank Transfer",
            amount: p.amount,
            direction: (p.direction === "IN" ? "in" : "out") as "in" | "out",
            status: undefined,
            payment: p,
          })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : []

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="pl-9"
          />
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <Button
            variant="outline"
            onClick={() => setNewClientOpen(true)}
            className="flex-1 gap-1.5 sm:flex-none"
          >
            <Plus className="h-3.5 w-3.5" /> Add Client
          </Button>
          <Button
            disabled={!selected}
            onClick={() => setPaymentOpen(true)}
            className="flex-1 gap-1.5 sm:flex-none"
          >
            <Plus className="h-3.5 w-3.5" /> Log Payment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionCard>
            {clientsPending ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-[60px] rounded-xl" />
                ))}
              </div>
            ) : (
              <motion.div
                variants={staggerParent}
                initial="hidden"
                animate="show"
                className="max-h-128 space-y-2 overflow-y-auto"
              >
                {sortedClients.map((client) => (
                  <PartyListItem
                    key={client.id}
                    title={client.name}
                    subtitle={client.company}
                    balance={clientBalances[client.id] ?? 0}
                    selected={client.id === selectedId}
                    onSelect={() => setSelectedId(client.id)}
                  />
                ))}
              </motion.div>
            )}
          </SectionCard>
        </div>

        <div className="lg:col-span-7">
          {clientsPending ? (
            <SectionCard>
              <div className="mb-5 flex items-center justify-between gap-4 border-b border-zinc-100 pb-5">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-12 w-32 rounded-xl" />
              </div>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-xl" />
                ))}
              </div>
            </SectionCard>
          ) : selected ? (
            <SectionCard>
              <div className="mb-5 flex flex-wrap items-start justify-between gap-4 border-b border-zinc-100 pb-5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-lg font-black tracking-tight text-slate-900">
                      {selected.name}
                    </h3>
                    <Link
                      href={`/admin/clients/${selected.id}`}
                      className="text-[11px] font-bold whitespace-nowrap text-emerald-700 hover:text-emerald-800 hover:underline"
                    >
                      View Details →
                    </Link>
                  </div>
                  <p className="truncate text-xs text-slate-500">
                    {selected.company} • {selected.contact}
                  </p>
                  <span className="mt-1 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    {selected.region}
                  </span>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3 text-right">
                  <div className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
                    Running Net Balance
                  </div>
                  <BalancePill balance={clientBalances[selected.id] ?? 0} />
                </div>
              </div>

              <motion.div
                variants={staggerParent}
                initial="hidden"
                animate="show"
                className="max-h-112 divide-y divide-slate-100 overflow-y-auto"
              >
                {timeline.length === 0 ? (
                  <EmptyState
                    icon={CreditCard}
                    title="No activity yet"
                    description="Trades and payments will appear here."
                  />
                ) : (
                  timeline.map((item) => (
                    <motion.div key={item.id} variants={staggerChild}>
                      <TimelineItem
                        icon={
                          item.kind === "trade" ? (
                            <CreditCard className="h-4 w-4" />
                          ) : item.direction === "in" ? (
                            <ArrowDownLeft className="h-4 w-4" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" />
                          )
                        }
                        iconTone={
                          item.kind === "trade"
                            ? "blue"
                            : item.direction === "in"
                              ? "emerald"
                              : "rose"
                        }
                        title={item.title}
                        subtitle={item.subtitle}
                        amount={item.amount}
                        direction={item.direction}
                        status={item.status}
                        actions={
                          item.payment ? (
                            <RowActions
                              disabled={!canManage}
                              onEdit={() => setEditPaymentTarget(item.payment!)}
                              onDelete={() =>
                                setDeletePaymentTarget(item.payment!)
                              }
                            />
                          ) : undefined
                        }
                      />
                    </motion.div>
                  ))
                )}
              </motion.div>
            </SectionCard>
          ) : (
            <EmptyState
              icon={CreditCard}
              title="Select a client"
              description="Choose a client from the list to view their statement."
            />
          )}
        </div>
      </div>

      {selected && (
        <LogPaymentModal
          open={paymentOpen}
          onOpenChange={setPaymentOpen}
          partyType="CLIENT"
          partyId={selected.id}
          partyName={selected.name}
        />
      )}
      <AddClientModal open={newClientOpen} onOpenChange={setNewClientOpen} />

      <LogPaymentModal
        open={editPaymentTarget !== null}
        onOpenChange={(open) => !open && setEditPaymentTarget(null)}
        mode="edit"
        initial={editPaymentTarget ?? undefined}
      />

      <ConfirmDialog
        open={deletePaymentTarget !== null}
        onOpenChange={(open) => !open && setDeletePaymentTarget(null)}
        title="Delete Payment"
        description="Permanently remove this payment? This cannot be undone."
        destructive
        confirmLabel="Delete"
        onConfirm={async () => {
          if (!deletePaymentTarget) return
          try {
            await deletePayment.mutateAsync(deletePaymentTarget.id)
            toast.success("Payment deleted.")
          } catch (error) {
            toast.error(getErrorMessage(error, "Failed to delete payment."))
          } finally {
            setDeletePaymentTarget(null)
          }
        }}
      />
    </>
  )
}
