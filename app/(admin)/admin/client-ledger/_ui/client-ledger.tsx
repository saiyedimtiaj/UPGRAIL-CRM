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
import { FilterBar, type FilterFieldDef } from "@/components/shared/filter-bar"
import { useUrlFilters } from "@/hooks/use-url-filters"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { AddClientModal } from "@/components/shared/add-client-modal"
import { Skeleton } from "@/components/ui/skeleton"
import type { ClientChargeStatus, Payment } from "@/lib/types"
import { usePermissions } from "@/hooks/use-permission"

const CHARGE_STATUS_TO_UI: Record<ClientChargeStatus, Status> = {
  AWAITING_CLIENT_RATE: "pending",
  POSTED: "finalized",
}

const EMPTY_FILTERS = {
  kind: "all",
  dateFrom: "",
  dateTo: "",
  q: "",
}

/** Entries shown per page of the merged timeline. */
const TIMELINE_PAGE_SIZE = 25

export function ClientLedger() {
  const { data: clients = [], isPending: clientsPending } = useActiveClients()
  // Ledgers used to pull a fixed 500 rows and filter in the browser, which
  // simply stopped being correct past 500. Load in pages instead and let the
  // operator ask for more.
  const [pageSize, setPageSize] = React.useState(100)
  const { data: txData } = useTransactions({ limit: pageSize })
  const { data: paymentsData } = usePayments({ limit: pageSize })
  const { data: balances } = useBalances()
  const deletePayment = useDeletePayment()

  const transactions = txData?.data ?? []
  const payments = paymentsData?.data ?? []
  const clientBalances = balances?.clientDues ?? {}

  const [search, setSearch] = React.useState("")
  const { filters, setFilters, reset, isDirty } = useUrlFilters(EMPTY_FILTERS)
  const debouncedQuery = useDebouncedValue(filters.q)
  const [timelinePage, setTimelinePage] = React.useState(1)


  const timelineFilterFields: FilterFieldDef[] = [
    {
      kind: "search",
      key: "q",
      label: "Search entries",
      placeholder: "Search by title or method…",
      span: 2,
    },
    {
      kind: "select",
      key: "kind",
      label: "Entry Type",
      options: [
        { value: "all", label: "All entries" },
        { value: "trade", label: "Trades only" },
        { value: "payment", label: "Payments only" },
      ],
    },
    { kind: "date", key: "dateFrom", label: "From" },
    { kind: "date", key: "dateTo", label: "To" },
  ]
  const [selectedId, setSelectedId] = React.useState<number | null>(
    clients[0]?.id ?? null
  )
  const [paymentOpen, setPaymentOpen] = React.useState(false)
  const [newClientOpen, setNewClientOpen] = React.useState(false)
  const [editPaymentTarget, setEditPaymentTarget] =
    React.useState<Payment | null>(null)
  const [deletePaymentTarget, setDeletePaymentTarget] =
    React.useState<Payment | null>(null)

  // A changed filter or a different client invalidates the page number.
  const timelineKey = `${selectedId}:${JSON.stringify({ ...filters, q: debouncedQuery })}`
  const [seenTimelineKey, setSeenTimelineKey] = React.useState(timelineKey)
  if (seenTimelineKey !== timelineKey) {
    setSeenTimelineKey(timelineKey)
    if (timelinePage !== 1) setTimelinePage(1)
  }

  const { can } = usePermissions()
  const canManage = can("client_ledger.edit")

  const sortedClients = [...clients]
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (clientBalances[b.id] ?? 0) - (clientBalances[a.id] ?? 0))

  const selected =
    clients.find((c) => c.id === selectedId) ?? (clients[0] ?? null)

  const entryMatchesFilters = (entry: {
    date: string
    kind: string
    title: string
    subtitle: string
  }) => {
    if (filters.kind !== "all" && entry.kind !== filters.kind) return false
    // Entry dates are ISO timestamps; comparing the date half keeps the
    // boundary days inclusive.
    const day = entry.date.slice(0, 10)
    if (filters.dateFrom && day < filters.dateFrom) return false
    if (filters.dateTo && day > filters.dateTo) return false
    if (debouncedQuery) {
      const needle = debouncedQuery.toLowerCase()
      if (
        !entry.title.toLowerCase().includes(needle) &&
        !entry.subtitle.toLowerCase().includes(needle)
      )
        return false
    }
    return true
  }

  const allEntries = selected
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
      ]
        .filter(entryMatchesFilters)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : []

  // The timeline merges two sources, so it is paginated here rather than by
  // the server — which cannot know the interleaved order.
  const totalEntries = allEntries.length
  const totalPages = Math.max(1, Math.ceil(totalEntries / TIMELINE_PAGE_SIZE))
  const currentPage = Math.min(timelinePage, totalPages)
  const timeline = allEntries.slice(
    (currentPage - 1) * TIMELINE_PAGE_SIZE,
    currentPage * TIMELINE_PAGE_SIZE
  )

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

              <div className="mb-4 border-b border-slate-100 pb-4">
                <FilterBar
                  fields={timelineFilterFields}
                  value={filters}
                  onChange={setFilters}
                  onReset={reset}
                  isDirty={isDirty}
                />
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

              {totalEntries > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                  <span className="text-[11px] font-semibold text-slate-500">
                    Showing{" "}
                    {(currentPage - 1) * TIMELINE_PAGE_SIZE + 1}–
                    {Math.min(currentPage * TIMELINE_PAGE_SIZE, totalEntries)} of{" "}
                    {totalEntries}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() => setTimelinePage((n) => Math.max(1, n - 1))}
                    >
                      Previous
                    </Button>
                    <span className="text-[11px] font-semibold text-slate-500">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= totalPages}
                      onClick={() => setTimelinePage((n) => n + 1)}
                    >
                      Next
                    </Button>
                    {/* The merge happens in the browser, so a deep page needs
                        more source rows pulled in. */}
                    {currentPage >= totalPages &&
                      (transactions.length >= pageSize ||
                        payments.length >= pageSize) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPageSize((n) => n + 100)}
                        >
                          Load older
                        </Button>
                      )}
                  </div>
                </div>
              )}
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
