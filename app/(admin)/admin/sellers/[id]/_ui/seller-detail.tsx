"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { motion } from "motion/react"
import {
  ArrowLeft,
  Pencil,
  Plus,
  Building2,
  Coins,
  Landmark,
  Zap,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react"

import { staggerChild, staggerParent } from "@/lib/animations"
import { useSeller, useUpdateSeller, useDeleteSeller, useSetSettlementConduit, useActiveSellers } from "@/features/use-sellers"
import { useTransactions } from "@/features/use-transactions"
import { useSettlements } from "@/features/use-settlements"
import { useBalances } from "@/features/use-analytics"
import { useMe } from "@/features/use-auth"
import { getErrorMessage } from "@/lib/handleError"
import { shortDate } from "@/lib/date"
import { bdt, usd, usdt } from "@/lib/format"
import { PageHeader } from "@/components/primitives/page-header"
import { StatCard } from "@/components/primitives/stat-card"
import { SectionCard } from "@/components/primitives/section-card"
import { DetailField } from "@/components/primitives/detail-field"
import { ActivePill } from "@/components/primitives/active-pill"
import { SellerKindPill } from "@/components/primitives/seller-kind-pill"
import { PartyDetailShell, isNotFoundError } from "@/components/primitives/party-detail-shell"
import { RowActions } from "@/components/shared/row-actions"
import { ConfirmDialog } from "@/components/primitives/confirm-dialog"
import { AddSellerModal } from "@/components/shared/add-seller-modal"
import { LogPaymentModal } from "@/components/shared/log-payment-modal"
import { Button } from "@/components/ui/button"
import { SellerTradesCard } from "./seller-trades-card"
import { SellerSettlementsCard } from "./seller-settlements-card"

const TOTALS_LIMIT = 500

export function SellerDetail({ id }: { id: number }) {
  const router = useRouter()
  const validId = Number.isInteger(id) && id > 0 ? id : null

  const { data: seller, isPending, isError, error, refetch } = useSeller(validId)
  const { data: balances } = useBalances()
  const { data: me } = useMe()
  const { data: activeSellers = [] } = useActiveSellers()
  const updateSeller = useUpdateSeller()
  const deleteSeller = useDeleteSeller()
  const setConduit = useSetSettlementConduit()

  const { data: totalsTx } = useTransactions({
    sellerId: validId ?? undefined,
    limit: TOTALS_LIMIT,
  })
  const { data: totalsSettlements } = useSettlements({
    sellerId: validId ?? undefined,
    limit: TOTALS_LIMIT,
  })

  const [editOpen, setEditOpen] = React.useState(false)
  const [paymentOpen, setPaymentOpen] = React.useState(false)
  const [deactivateTarget, setDeactivateTarget] = React.useState<"deactivate" | "reactivate" | null>(null)
  const [removeOpen, setRemoveOpen] = React.useState(false)
  const [conduitConfirmOpen, setConduitConfirmOpen] = React.useState(false)

  const canManage = me?.role.name === "OWNER" || me?.role.name === "PARTNER"
  const isOwner = me?.role.name === "OWNER"

  const notFound = validId === null || isNotFoundError(error)

  const nonVoidedTrades = (totalsTx?.data ?? []).filter((t) => !t.voided)
  const totalUsdSupplied = nonVoidedTrades.reduce((sum, t) => sum + t.usd_amount, 0)
  const totalUsdtEntitlement = nonVoidedTrades.reduce((sum, t) => sum + t.seller_usdt_entitlement, 0)
  const nonVoidedSettlements = (totalsSettlements?.data ?? []).filter((s) => !s.voided)
  const totalUsdtSettled = nonVoidedSettlements.reduce((sum, s) => sum + s.usdt_amount, 0)
  const totalBdtSettled = nonVoidedSettlements.reduce((sum, s) => sum + s.bdt_equivalent, 0)
  const totalsTruncated =
    (totalsTx?.meta.totalCount ?? 0) > TOTALS_LIMIT || (totalsSettlements?.meta.totalCount ?? 0) > TOTALS_LIMIT

  const currentConduit = activeSellers.find((s) => s.isSettlementConduit)

  return (
    <PartyDetailShell
      isPending={isPending}
      isError={isError}
      error={error}
      notFound={notFound}
      backHref="/admin/sellers"
      backLabel="Back to Sellers"
      entityLabel="Seller"
      onRetry={() => refetch()}
    >
      {seller && (
        <motion.div variants={staggerParent} initial="hidden" animate="show" className="space-y-5 sm:space-y-6">
          <motion.div variants={staggerChild}>
            <PageHeader
              icon={Building2}
              title={seller.flag ? `${seller.flag} ${seller.name}` : seller.name}
              subtitle={`${seller.region} • ${seller.rate_type}`}
            >
              <Link
                href="/admin/sellers"
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
                      ...(isOwner && !seller.isSettlementConduit
                        ? [
                            {
                              label: "Set as Settlement Conduit",
                              icon: ShieldCheck,
                              onSelect: () => setConduitConfirmOpen(true),
                            },
                          ]
                        : []),
                      {
                        label: seller.active ? "Deactivate" : "Reactivate",
                        onSelect: () => setDeactivateTarget(seller.active ? "deactivate" : "reactivate"),
                      },
                      ...(!seller.isSettlementConduit
                        ? [{ label: "Remove", onSelect: () => setRemoveOpen(true), destructive: true }]
                        : []),
                    ]}
                  />
                </>
              )}
            </PageHeader>
          </motion.div>

          {!seller.active && (
            <motion.div
              variants={staggerChild}
              className="flex items-center gap-2.5 rounded-panel border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            >
              This seller is deactivated — they won&rsquo;t appear in trade-entry pickers.
            </motion.div>
          )}

          <motion.div variants={staggerChild} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {seller.isSettlementConduit ? (
              <StatCard
                tone="dark"
                icon={Landmark}
                label="Nazmul Due (BDT)"
                value={balances?.nazmulDue ?? 0}
                format={(n) => bdt(n)}
                footer={
                  <span className="text-[11px] font-semibold text-zinc-400">
                    Conduit obligations settle in BDT, not USDT.
                  </span>
                }
              />
            ) : (
              <StatCard
                tone="dark"
                icon={Coins}
                label="USDT Owed"
                value={balances?.sellerUsdtDues[seller.id] ?? 0}
                format={(n) => usdt(n)}
                footer={<span className="text-[11px] font-semibold text-zinc-400">Live unsettled balance</span>}
              />
            )}
            <StatCard
              tone="light"
              icon={Zap}
              label="USD Supplied"
              value={totalUsdSupplied}
              format={(n) => usd(n)}
              footer={
                <span className="text-[11px] font-semibold text-slate-500">
                  {nonVoidedTrades.length} trade(s) • {usdt(totalUsdtEntitlement)} entitlement
                  {totalsTruncated ? " (500+ cap)" : ""}
                </span>
              }
            />
            <StatCard
              tone="mint"
              icon={ArrowUpRight}
              label="USDT Settled"
              value={totalUsdtSettled}
              format={(n) => usdt(n)}
              footer={
                <span className="text-[11px] font-semibold text-emerald-800/70">
                  ≈ {bdt(totalBdtSettled)} at settlement rates
                </span>
              }
            />
          </motion.div>

          <motion.div variants={staggerChild}>
            <SectionCard
              title="Profile"
              action={
                <div className="flex items-center gap-2">
                  <SellerKindPill isSettlementConduit={seller.isSettlementConduit} />
                  <ActivePill active={seller.active} />
                </div>
              }
            >
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <DetailField label="Contact" value={seller.contact} mono />
                <DetailField label="Region" value={seller.region} />
                <DetailField label="Rate Type" value={seller.rate_type} />
                <DetailField label="Seller Since" value={shortDate(seller.created_at)} />
                {seller.notes && (
                  <DetailField label="Notes" value={seller.notes} className="col-span-2 sm:col-span-4" />
                )}
              </div>
            </SectionCard>
          </motion.div>

          <motion.div variants={staggerChild}>
            <SellerTradesCard sellerId={seller.id} />
          </motion.div>

          <motion.div variants={staggerChild}>
            <SellerSettlementsCard sellerId={seller.id} canManage={canManage} />
          </motion.div>
        </motion.div>
      )}

      <AddSellerModal open={editOpen} onOpenChange={setEditOpen} mode="edit" initial={seller} />

      {seller && (
        <LogPaymentModal
          open={paymentOpen}
          onOpenChange={setPaymentOpen}
          partyType="DIRECT_SELLER"
          partyId={seller.id}
          partyName={seller.name}
        />
      )}

      <ConfirmDialog
        open={deactivateTarget !== null}
        onOpenChange={(open) => !open && setDeactivateTarget(null)}
        title={deactivateTarget === "deactivate" ? "Deactivate Seller" : "Reactivate Seller"}
        description={
          deactivateTarget === "deactivate"
            ? `Deactivate ${seller?.name ?? "this seller"}? They'll stop appearing in trade-entry pickers, but their history stays intact.`
            : `Reactivate ${seller?.name ?? "this seller"}? They'll appear in trade-entry pickers again.`
        }
        confirmLabel={deactivateTarget === "deactivate" ? "Deactivate" : "Reactivate"}
        destructive={deactivateTarget === "deactivate"}
        onConfirm={async () => {
          if (!seller || !deactivateTarget) return
          try {
            await updateSeller.mutateAsync({ id: seller.id, active: deactivateTarget !== "deactivate" })
            toast.success(deactivateTarget === "deactivate" ? "Seller deactivated." : "Seller reactivated.")
          } catch (error) {
            toast.error(getErrorMessage(error, "Failed to update seller."))
          } finally {
            setDeactivateTarget(null)
          }
        }}
      />

      <ConfirmDialog
        open={removeOpen}
        onOpenChange={setRemoveOpen}
        title="Remove Seller"
        description={`Remove ${seller?.name ?? "this seller"}? If they have trade, rate, payment, or settlement history, they'll be deactivated instead of deleted so historical balances stay intact.`}
        destructive
        confirmLabel="Remove"
        onConfirm={async () => {
          if (!seller) return
          try {
            const result = await deleteSeller.mutateAsync(seller.id)
            toast.success(result.message ?? `${seller.name} removed.`)
            router.push("/admin/sellers")
          } catch (error) {
            toast.error(getErrorMessage(error, "Failed to remove seller."))
          } finally {
            setRemoveOpen(false)
          }
        }}
      />

      <ConfirmDialog
        open={conduitConfirmOpen}
        onOpenChange={setConduitConfirmOpen}
        title="Set Settlement Conduit"
        description={`Make ${seller?.name ?? "this seller"} the settlement conduit? ${
          currentConduit ? `This replaces ${currentConduit.name} as the current conduit. ` : ""
        }Card-seller USDT settlements and USDT rate entry are always made against the conduit seller.`}
        confirmLabel="Set as Conduit"
        onConfirm={async () => {
          if (!seller) return
          try {
            await setConduit.mutateAsync(seller.id)
            toast.success(`${seller.name} is now the settlement conduit.`)
          } catch (error) {
            toast.error(getErrorMessage(error, "Failed to set settlement conduit."))
          } finally {
            setConduitConfirmOpen(false)
          }
        }}
      />
    </PartyDetailShell>
  )
}
