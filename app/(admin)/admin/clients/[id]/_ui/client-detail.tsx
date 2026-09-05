"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { motion } from "motion/react"
import { ArrowLeft, Pencil, Plus, Users, Wallet, TrendingUp, ArrowDownLeft, X } from "lucide-react"

import { staggerChild, staggerParent } from "@/lib/animations"
import { useClient, useUpdateClient, useDeleteClient } from "@/features/use-clients"
import { useTransactions } from "@/features/use-transactions"
import { usePayments } from "@/features/use-payments"
import { useBalances } from "@/features/use-analytics"
import { getErrorMessage } from "@/lib/handleError"
import { shortDate, todayISO } from "@/lib/date"
import { bdt, usd } from "@/lib/format"
import { PageHeader } from "@/components/primitives/page-header"
import { StatCard } from "@/components/primitives/stat-card"
import { DatePicker } from "@/components/ui/date-picker"
import { Label } from "@/components/ui/label"
import { TransactionsTable } from "@/components/shared/transactions-table"
import { SectionCard } from "@/components/primitives/section-card"
import { DetailField } from "@/components/primitives/detail-field"
import { ActivePill } from "@/components/primitives/active-pill"
import { PartyDetailShell, isNotFoundError } from "@/components/primitives/party-detail-shell"
import { RowActions } from "@/components/shared/row-actions"
import { ConfirmDialog } from "@/components/primitives/confirm-dialog"
import { AddClientModal } from "@/components/shared/add-client-modal"
import { LogPaymentModal } from "@/components/shared/log-payment-modal"
import { Button } from "@/components/ui/button"
import { usePermissions } from "@/hooks/use-permission"
import { ClientPaymentsCard } from "./client-payments-card"

const TOTALS_LIMIT = 500

export function ClientDetail({ id }: { id: number }) {
  const router = useRouter()
  const validId = Number.isInteger(id) && id > 0 ? id : null

  const { data: client, isPending, isError, error, refetch } = useClient(validId)
  const { data: balances } = useBalances()
  const updateClient = useUpdateClient()
  const deleteClient = useDeleteClient()

  // Empty means lifetime — the stats row filters to this range without
  // touching the Transactions/Payments tables further down the page.
  const [statsRange, setStatsRange] = React.useState({ from: "", to: "" })
  const hasRangeFilter = statsRange.from !== "" || statsRange.to !== ""

  const { data: totalsTx } = useTransactions({
    clientId: validId ?? undefined,
    limit: TOTALS_LIMIT,
    dateFrom: statsRange.from || undefined,
    dateTo: statsRange.to || undefined,
  })
  const { data: totalsPay } = usePayments({
    partyType: "CLIENT",
    partyId: validId ?? undefined,
    limit: TOTALS_LIMIT,
    dateFrom: statsRange.from || undefined,
    dateTo: statsRange.to || undefined,
  })

  const [editOpen, setEditOpen] = React.useState(false)
  const [paymentOpen, setPaymentOpen] = React.useState(false)
  const [deactivateTarget, setDeactivateTarget] = React.useState<"deactivate" | "reactivate" | null>(null)
  const [removeOpen, setRemoveOpen] = React.useState(false)

  const { can } = usePermissions()
  const canManage = can("clients.edit")

  const notFound = validId === null || isNotFoundError(error)

  const nonVoidedTrades = (totalsTx?.data ?? []).filter((t) => !t.voided)
  const totalUsdVolume = nonVoidedTrades.reduce((sum, t) => sum + t.usd_amount, 0)
  const totalClientCharge = nonVoidedTrades.reduce((sum, t) => sum + (t.sell_bdt ?? 0), 0)
  const totalProfit = nonVoidedTrades.reduce((sum, t) => sum + (t.profit ?? 0), 0)
  const nonVoidedPayments = (totalsPay?.data ?? []).filter((p) => !p.voided)
  const lifetimePaid = nonVoidedPayments.reduce(
    (sum, p) => sum + (p.direction === "IN" ? p.amount : -p.amount),
    0
  )
  const lastPayment = nonVoidedPayments[0]
  const totalsTruncated =
    (totalsTx?.meta.totalCount ?? 0) > TOTALS_LIMIT || (totalsPay?.meta.totalCount ?? 0) > TOTALS_LIMIT
  const rangePostedCharges = nonVoidedTrades
    .filter((t) => t.client_charge_status === "POSTED")
    .reduce((sum, t) => sum + (t.sell_bdt ?? 0), 0)
  const rangeDue = rangePostedCharges - lifetimePaid
  const outstandingDue = hasRangeFilter
    ? rangeDue
    : (balances?.clientDues[client?.id ?? -1] ?? 0)

  return (
    <PartyDetailShell
      isPending={isPending}
      isError={isError}
      error={error}
      notFound={notFound}
      backHref="/admin/clients"
      backLabel="Back to Clients"
      entityLabel="Client"
      onRetry={() => refetch()}
    >
      {client && (
        <motion.div variants={staggerParent} initial="hidden" animate="show" className="space-y-5 sm:space-y-6">
          <motion.div variants={staggerChild}>
            <PageHeader icon={Users} title={client.name} subtitle={[client.company, client.region].filter(Boolean).join(" • ")}>
              <Link
                href="/admin/clients"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-[0.8rem] font-medium hover:bg-muted"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </Link>
              {canManage && (
                <>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditOpen(true)}>
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button size="sm" className="gap-1.5" onClick={() => setPaymentOpen(true)}>
                    <Plus className="h-3.5 w-3.5" />
                    Log Payment
                  </Button>
                  <RowActions
                    extraActions={[
                      {
                        label: client.active ? "Deactivate" : "Reactivate",
                        onSelect: () => setDeactivateTarget(client.active ? "deactivate" : "reactivate"),
                      },
                      {
                        label: "Remove",
                        onSelect: () => setRemoveOpen(true),
                        destructive: true,
                      },
                    ]}
                  />
                </>
              )}
            </PageHeader>
          </motion.div>

          {!client.active && (
            <motion.div
              variants={staggerChild}
              className="flex items-center gap-2.5 rounded-panel border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            >
              This client is deactivated — they won&rsquo;t appear in trade-entry pickers.
            </motion.div>
          )}

          <motion.div variants={staggerChild} className="flex justify-end">
            <div className="flex flex-wrap items-end gap-2.5">
              <div className="space-y-1.5">
                <Label htmlFor="stats-date-from" className="text-[11px] text-slate-500">
                  From
                </Label>
                <DatePicker
                  id="stats-date-from"
                  value={statsRange.from}
                  onChange={(next) => setStatsRange((r) => ({ ...r, from: next }))}
                  max={statsRange.to || todayISO()}
                  clearable
                  className="h-9 w-40"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stats-date-to" className="text-[11px] text-slate-500">
                  To
                </Label>
                <DatePicker
                  id="stats-date-to"
                  value={statsRange.to}
                  onChange={(next) => setStatsRange((r) => ({ ...r, to: next }))}
                  min={statsRange.from || undefined}
                  max={todayISO()}
                  clearable
                  className="h-9 w-40"
                />
              </div>
              {hasRangeFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-1 text-slate-500"
                  onClick={() => setStatsRange({ from: "", to: "" })}
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </Button>
              )}
            </div>
          </motion.div>

          <motion.div
            variants={staggerChild}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            <StatCard
              accent="amber"
              icon={Wallet}
              label={hasRangeFilter ? "Due in Range" : "Outstanding Due"}
              value={outstandingDue}
              format={(n) => bdt(n)}
              footer={
                <span className="text-[11px] font-semibold text-slate-500">
                  {hasRangeFilter
                    ? "Charged minus paid, within this window"
                    : "Live receivable balance"}
                </span>
              }
            />
            <StatCard
              tone="light"
              accent="sky"
              icon={TrendingUp}
              label={hasRangeFilter ? "Volume in Range" : "Lifetime Volume"}
              value={totalUsdVolume}
              format={(n) => usd(n)}
              footer={
                <span className="text-[11px] font-semibold text-slate-500">
                  {nonVoidedTrades.length} trade(s) • {bdt(totalClientCharge)} charged
                  {totalsTruncated ? " (500+ cap)" : ""}
                </span>
              }
            />
            <StatCard
              accent="emerald"
              icon={TrendingUp}
              label={hasRangeFilter ? "Profit in Range" : "Total Profit"}
              value={totalProfit}
              format={(n) => bdt(n)}
              footer={
                <span className="text-[11px] font-semibold text-slate-500">
                  From finalized trades only
                </span>
              }
            />
            <StatCard
              accent="teal"
              icon={ArrowDownLeft}
              label={hasRangeFilter ? "Paid in Range" : "Lifetime Paid"}
              value={lifetimePaid}
              format={(n) => bdt(n)}
              footer={
                <span className="text-[11px] font-semibold text-slate-500">
                  {lastPayment
                    ? `Last: ${shortDate(lastPayment.date)}`
                    : "No payments yet"}
                </span>
              }
            />
          </motion.div>

          <motion.div variants={staggerChild}>
            <SectionCard title="Profile" action={<ActivePill active={client.active} />}>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <DetailField label="Company" value={client.company} />
                <DetailField label="Contact" value={client.contact} mono />
                <DetailField label="Region" value={client.region} />
                <DetailField label="Client Since" value={shortDate(client.created_at)} />
                {client.notes && (
                  <DetailField label="Notes" value={client.notes} className="col-span-2 sm:col-span-4" />
                )}
              </div>
            </SectionCard>
          </motion.div>

          <motion.div variants={staggerChild}>
            <SectionCard
              title="Transactions"
              subtitle="Every trade booked against this client"
            >
              <TransactionsTable
                filters={{ clientId: client.id }}
                hide={["client"]}
                emptyLabel="transactions"
                showFilters
              />
            </SectionCard>
          </motion.div>

          <motion.div variants={staggerChild}>
            <ClientPaymentsCard clientId={client.id} canManage={canManage} />
          </motion.div>
        </motion.div>
      )}

      <AddClientModal open={editOpen} onOpenChange={setEditOpen} mode="edit" initial={client} />

      {client && (
        <LogPaymentModal
          open={paymentOpen}
          onOpenChange={setPaymentOpen}
          partyType="CLIENT"
          partyId={client.id}
          partyName={client.name}
        />
      )}

      <ConfirmDialog
        open={deactivateTarget !== null}
        onOpenChange={(open) => !open && setDeactivateTarget(null)}
        title={deactivateTarget === "deactivate" ? "Deactivate Client" : "Reactivate Client"}
        description={
          deactivateTarget === "deactivate"
            ? `Deactivate ${client?.name ?? "this client"}? They'll stop appearing in trade-entry pickers, but their history stays intact.`
            : `Reactivate ${client?.name ?? "this client"}? They'll appear in trade-entry pickers again.`
        }
        confirmLabel={deactivateTarget === "deactivate" ? "Deactivate" : "Reactivate"}
        destructive={deactivateTarget === "deactivate"}
        onConfirm={async () => {
          if (!client || !deactivateTarget) return
          try {
            await updateClient.mutateAsync({ id: client.id, active: deactivateTarget !== "deactivate" })
            toast.success(deactivateTarget === "deactivate" ? "Client deactivated." : "Client reactivated.")
          } catch (error) {
            toast.error(getErrorMessage(error, "Failed to update client."))
          } finally {
            setDeactivateTarget(null)
          }
        }}
      />

      <ConfirmDialog
        open={removeOpen}
        onOpenChange={setRemoveOpen}
        title="Remove Client"
        description={`Remove ${client?.name ?? "this client"}? If they have trade or payment history, they'll be deactivated instead of deleted so historical balances stay intact.`}
        destructive
        confirmLabel="Remove"
        onConfirm={async () => {
          if (!client) return
          try {
            const result = await deleteClient.mutateAsync(client.id)
            toast.success(result.message ?? `${client.name} removed.`)
            router.push("/admin/clients")
          } catch (error) {
            toast.error(getErrorMessage(error, "Failed to remove client."))
          } finally {
            setRemoveOpen(false)
          }
        }}
      />
    </PartyDetailShell>
  )
}
