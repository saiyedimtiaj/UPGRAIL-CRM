"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { motion } from "motion/react"
import {
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  Plus,
  Search,
} from "lucide-react"

import { staggerParent, staggerChild } from "@/lib/animations"
import { useActiveSellers } from "@/features/use-sellers"
import { useTransactions } from "@/features/use-transactions"
import { useSettlements, useVoidSettlement } from "@/features/use-settlements"
import { usePayments, useDeletePayment } from "@/features/use-payments"
import { useBalances } from "@/features/use-analytics"
import { useMe } from "@/features/use-auth"
import { getErrorMessage } from "@/lib/handleError"
import { SectionCard } from "@/components/primitives/section-card"
import { PartyListItem } from "@/components/primitives/party-list-item"
import { TimelineItem } from "@/components/primitives/timeline-item"
import { EmptyState } from "@/components/primitives/empty-state"
import { FilterPills } from "@/components/primitives/filter-pills"
import { RowActions } from "@/components/shared/row-actions"
import { ConfirmDialog } from "@/components/primitives/confirm-dialog"
import { Usdt } from "@/components/primitives/money"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LogPaymentModal } from "@/components/shared/log-payment-modal"
import { LogSettlementModal } from "@/app/(admin)/admin/seller-ledger/_ui/log-settlement-modal"
import { AddSellerModal } from "@/components/shared/add-seller-modal"
import { Skeleton } from "@/components/ui/skeleton"
import type { Payment, Seller, USDTSettlement } from "@/lib/types"

type SellerFilter = "all" | "conduit" | "external"


export function SellerLedger() {
  const { data: sellers = [], isPending: sellersPending } = useActiveSellers()
  // Ledgers used to pull a fixed 500 rows and filter in the browser, which
  // simply stopped being correct past 500. Load in pages instead and let the
  // operator ask for more.
  const [pageSize, setPageSize] = React.useState(100)
  const { data: txData } = useTransactions({ limit: pageSize })
  const { data: settlementsData } = useSettlements({ limit: pageSize })
  const { data: paymentsData } = usePayments({ limit: pageSize })
  const { data: balances } = useBalances()
  const sellerUsdtDues = balances?.sellerUsdtDues ?? {}
  const nazmulDue = balances?.nazmulDue ?? 0
  const { data: me } = useMe()
  const deletePayment = useDeletePayment()
  const voidSettlement = useVoidSettlement()

  const transactions = txData?.data ?? []
  const settlements = settlementsData?.data ?? []
  const payments = paymentsData?.data ?? []

  const [filter, setFilter] = React.useState<SellerFilter>("all")
  const [search, setSearch] = React.useState("")
  const [selectedId, setSelectedId] = React.useState<number | null>(
    sellers[0]?.id ?? null
  )
  const [paymentOpen, setPaymentOpen] = React.useState(false)
  const [settlementOpen, setSettlementOpen] = React.useState(false)
  const [newSellerOpen, setNewSellerOpen] = React.useState(false)
  const [editPaymentTarget, setEditPaymentTarget] =
    React.useState<Payment | null>(null)
  const [deletePaymentTarget, setDeletePaymentTarget] =
    React.useState<Payment | null>(null)
  const [voidSettlementTarget, setVoidSettlementTarget] =
    React.useState<USDTSettlement | null>(null)

  const canManage = me?.role.name === "OWNER" || me?.role.name === "PARTNER"

  const filteredSellers = sellers
    .filter(
      (s) =>
        filter === "all" ||
        (filter === "conduit" ? s.isSettlementConduit : !s.isSettlementConduit)
    )
    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))

  const selected: Seller | null =
    sellers.find((s) => s.id === selectedId) ?? (sellers[0] ?? null)
  const isConduit = !!selected?.isSettlementConduit

  const usdtBalance =
    selected && !isConduit ? (sellerUsdtDues[selected.id] ?? 0) : 0
  const bdtBalance = selected && isConduit ? nazmulDue : 0

  const timeline = selected
    ? !isConduit
      ? [
          ...transactions
            .filter((t) => t.seller_id === selected.id && !t.voided)
            .map((t) => ({
              id: `t-${t.id}`,
              date: t.created_at,
              title: `Trade ${t.id} USDT Entitlement`,
              subtitle: `$${t.usd_amount.toLocaleString()} @ ${t.card_rate}%`,
              amount: t.seller_usdt_entitlement,
              direction: "out" as const,
              settlement: undefined as USDTSettlement | undefined,
              payment: undefined as Payment | undefined,
            })),
          ...settlements
            .filter((s) => s.seller_id === selected.id && !s.voided)
            .map((s) => ({
              id: `s-${s.id}`,
              date: s.created_at,
              title: "USDT Settlement Sent",
              subtitle: s.note ?? "TRC20 transfer",
              amount: s.usdt_amount,
              direction: "in" as const,
              settlement: s as USDTSettlement | undefined,
              payment: undefined as Payment | undefined,
            })),
        ].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      : [
          ...transactions
            .filter(
              (t) =>
                t.seller_id === selected.id &&
                !t.voided &&
                t.profit_status === "FINALIZED"
            )
            .map((t) => ({
              id: `t-${t.id}`,
              date: t.created_at,
              title: `USD Supplied ${t.id}`,
              subtitle: `$${t.usd_amount.toLocaleString()}`,
              amount: t.actual_buy_bdt ?? 0,
              direction: "out" as const,
              settlement: undefined as USDTSettlement | undefined,
              payment: undefined as Payment | undefined,
            })),
          ...payments
            .filter(
              (p) =>
                p.party_type === "DIRECT_SELLER" && p.party_id === selected.id
            )
            .map((p) => ({
              id: `p-${p.id}`,
              date: p.created_at,
              title:
                p.direction === "OUT" ? "Payment Made" : "Payment Reversed",
              subtitle: p.method ?? "Bank Transfer",
              amount: p.amount,
              direction: (p.direction === "OUT" ? "out" : "in") as
                | "in"
                | "out",
              settlement: undefined as USDTSettlement | undefined,
              payment: p as Payment | undefined,
            })),
        ].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
    : []

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="overflow-x-auto">
          <FilterPills
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "All Sourcing Desks" },
              { value: "conduit", label: "Settlement Conduit (BDT)" },
              { value: "external", label: "External Sellers (USDT)" },
            ]}
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-1 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sellers..."
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setNewSellerOpen(true)}
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Add Seller
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionCard>
            {sellersPending ? (
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
                {filteredSellers.map((seller) => (
                  <PartyListItem
                    key={seller.id}
                    title={`${seller.flag} ${seller.name}`}
                    subtitle={`${seller.region} • ${seller.isSettlementConduit ? "Settlement Conduit" : "External Seller"}`}
                    balance={
                      seller.isSettlementConduit
                        ? nazmulDue
                        : (sellerUsdtDues[seller.id] ?? 0)
                    }
                    selected={seller.id === selectedId}
                    onSelect={() => setSelectedId(seller.id)}
                  />
                ))}
              </motion.div>
            )}
          </SectionCard>
        </div>

        <div className="lg:col-span-7">
          {sellersPending ? (
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
                      {selected.flag} {selected.name}
                    </h3>
                    <Link
                      href={`/admin/sellers/${selected.id}`}
                      className="text-[11px] font-bold whitespace-nowrap text-emerald-700 hover:text-emerald-800 hover:underline"
                    >
                      View Details →
                    </Link>
                  </div>
                  <p className="truncate text-xs text-slate-500">
                    {selected.contact} • {selected.notes}
                  </p>
                  <span className="mt-1 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    {isConduit ? "Settlement Conduit" : "External Seller"}
                  </span>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3 text-right">
                  <div className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
                    {isConduit ? "Net BDT Payable" : "Net USDT Owed"}
                  </div>
                  {isConduit ? (
                    <div className="font-mono text-sm font-black text-slate-900">
                      ৳{Math.round(bdtBalance).toLocaleString()}
                    </div>
                  ) : (
                    <Usdt
                      value={usdtBalance}
                      className="text-sm font-black text-slate-900"
                    />
                  )}
                </div>
              </div>

              <div className="mb-4">
                <Button
                  onClick={() =>
                    isConduit ? setPaymentOpen(true) : setSettlementOpen(true)
                  }
                  className="gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {isConduit
                    ? "Log BDT Payment to Nazmul"
                    : "Log USDT Settlement"}
                </Button>
              </div>

              <motion.div
                variants={staggerParent}
                initial="hidden"
                animate="show"
                className="max-h-96 divide-y divide-slate-100 overflow-y-auto"
              >
                {timeline.length === 0 ? (
                  <EmptyState icon={Building2} title="No activity yet" />
                ) : (
                  timeline.map((item) => (
                    <motion.div key={item.id} variants={staggerChild}>
                      <TimelineItem
                        icon={
                          item.direction === "in" ? (
                            <ArrowDownLeft className="h-4 w-4" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" />
                          )
                        }
                        iconTone={
                          item.direction === "in"
                            ? "emerald"
                            : isConduit
                              ? "rose"
                              : "amber"
                        }
                        title={item.title}
                        subtitle={item.subtitle}
                        amount={item.amount}
                        direction={item.direction}
                        actions={
                          item.payment ? (
                            <RowActions
                              disabled={!canManage}
                              onEdit={() => setEditPaymentTarget(item.payment!)}
                              onDelete={() =>
                                setDeletePaymentTarget(item.payment!)
                              }
                            />
                          ) : item.settlement ? (
                            <RowActions
                              disabled={!canManage}
                              extraActions={[
                                {
                                  label: "Void Settlement",
                                  onSelect: () =>
                                    setVoidSettlementTarget(item.settlement!),
                                  destructive: true,
                                },
                              ]}
                            />
                          ) : undefined
                        }
                      />
                    </motion.div>
                  ))
                )}
              </motion.div>

              {timeline.length >= pageSize - 1 && (
                <div className="border-t border-slate-100 pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setPageSize((n) => n + 100)}
                  >
                    Load more
                  </Button>
                </div>
              )}
            </SectionCard>
          ) : (
            <EmptyState
              icon={Building2}
              title="Select a seller"
              description="Choose a seller from the list to view their ledger."
            />
          )}
        </div>
      </div>

      {selected && isConduit && (
        <LogPaymentModal
          open={paymentOpen}
          onOpenChange={setPaymentOpen}
          partyType="DIRECT_SELLER"
          partyId={selected.id}
          partyName={selected.name}
        />
      )}
      {selected && !isConduit && (
        <LogSettlementModal
          open={settlementOpen}
          onOpenChange={setSettlementOpen}
          sellerId={selected.id}
          sellerName={selected.name}
        />
      )}
      <AddSellerModal open={newSellerOpen} onOpenChange={setNewSellerOpen} />

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

      <ConfirmDialog
        open={voidSettlementTarget !== null}
        onOpenChange={(open) => !open && setVoidSettlementTarget(null)}
        title="Void Settlement"
        description="Settlements are never deleted — this reverses the allocation, un-settling the covered trades, and requires a reason for the audit trail."
        requireReason
        reasonLabel="Reason for voiding"
        destructive
        confirmLabel="Void Settlement"
        onConfirm={async (reason) => {
          if (!voidSettlementTarget || !reason) return
          try {
            await voidSettlement.mutateAsync({ id: voidSettlementTarget.id, reason })
            toast.success("Settlement voided.")
          } catch (error) {
            toast.error(getErrorMessage(error, "Failed to void settlement."))
          } finally {
            setVoidSettlementTarget(null)
          }
        }}
      />
    </>
  )
}
