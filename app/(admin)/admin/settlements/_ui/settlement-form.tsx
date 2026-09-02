"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { findConduitSeller } from "@/lib/calc/rates"
import { useActiveSellers } from "@/features/use-sellers"
import { useCreateSettlement, usePreviewAllocation } from "@/features/use-settlements"
import { getErrorMessage } from "@/lib/handleError"
import { todayISO } from "@/lib/date"
import { useConfetti } from "@/hooks/use-confetti"
import { useBalances } from "@/features/use-analytics"
import { SectionCard } from "@/components/primitives/section-card"
import { SearchableSelect } from "@/components/primitives/searchable-select"
import { Alert } from "@/components/shared/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SubmitButton } from "@/components/primitives/submit-button"
import { Usdt } from "@/components/primitives/money"
import type { AllocationOverride } from "@/services/settlements.api"

export function SettlementForm() {
  const router = useRouter()
  const { data: sellers = [] } = useActiveSellers()
  const { data: balances } = useBalances()
  const sellerUsdtDues = balances?.sellerUsdtDues ?? {}
  const createSettlement = useCreateSettlement()
  const fireConfetti = useConfetti()

  const conduitSeller = findConduitSeller(sellers)

  const externalSellers = sellers.filter((s) => !s.isSettlementConduit)

  // Sellers arrive from a query, so the first render has none. The initial
  // value alone would latch undefined forever and leave the form with no
  // seller selected — fall back to the first external seller once they load.
  const [sellerId, setSellerId] = React.useState<number | undefined>(undefined)
  const effectiveSellerId = sellerId ?? externalSellers[0]?.id
  const [date, setDate] = React.useState(todayISO())
  const [usdtAmount, setUsdtAmount] = React.useState("")
  const [note, setNote] = React.useState("")
  const [overrides, setOverrides] = React.useState<Record<number, string> | null>(null)

  const numAmount = Number(usdtAmount) || undefined
  const { data: preview, isFetching: previewLoading } = usePreviewAllocation(
    effectiveSellerId,
    numAmount
  )
  const proposal = preview?.allocations ?? []

  const inputsKey = `${effectiveSellerId ?? ""}:${usdtAmount}`
  const [overridesFor, setOverridesFor] = React.useState(inputsKey)
  if (overridesFor !== inputsKey) {
    setOverridesFor(inputsKey)
    if (overrides !== null) setOverrides(null)
  }

  const rows = overrides
    ? proposal.map((p) => ({
        ...p,
        allocated_usdt: Number(overrides[p.transaction_id] ?? p.allocated_usdt),
      }))
    : proposal

  const allocatedTotal = rows.reduce((sum, r) => sum + (r.allocated_usdt || 0), 0)
  const isOverridden = overrides !== null
  const selectedSeller = sellers.find((s) => s.id === effectiveSellerId)

  const allocationSumMatches =
    numAmount !== undefined && Math.abs(allocatedTotal - numAmount) <= 0.000001
  const exceedsOutstanding = !isOverridden && !!preview?.exceeds_outstanding
  const maxSettleable = preview?.max_settleable_usdt ?? 0

  function updateOverride(transactionId: number, value: string) {
    setOverrides((prev) => {
      const base: Record<number, string> = { ...(prev ?? {}) }
      if (prev === null) {
        for (const p of proposal) base[p.transaction_id] = String(p.allocated_usdt)
      }
      base[transactionId] = value
      return base
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const num = Number(usdtAmount)
    if (!num || !effectiveSellerId) return
    if (!conduitSeller) {
      toast.error("No settlement conduit is configured yet.")
      return
    }
    if (exceedsOutstanding) {
      toast.error(
        `This settlement exceeds what ${selectedSeller?.name ?? "this seller"} is owed. The maximum is ${maxSettleable.toLocaleString()} USDT.`
      )
      return
    }
    if (isOverridden && !allocationSumMatches) {
      toast.error("Allocations must sum exactly to the settled amount.")
      return
    }

    const allocations: AllocationOverride[] | undefined = isOverridden
      ? rows
          .filter((r) => r.allocated_usdt > 0)
          .map((r) => ({ transactionId: r.transaction_id, allocatedUsdt: r.allocated_usdt }))
      : undefined

    try {
      await createSettlement.mutateAsync({
        date,
        sellerId: effectiveSellerId,
        usdtAmount: num,
        note: note || undefined,
        allocations,
      })
      fireConfetti()
      toast.success(`${num.toLocaleString()} USDT settlement logged.`)
      setUsdtAmount("")
      setNote("")
      setOverrides(null)
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to log settlement."))
    }
  }

  return (
    <SectionCard title="Settle External Seller (USDT Allocation)">
      <form onSubmit={handleSubmit} className="space-y-4">
        {!conduitSeller && (
          <Alert
            variant="warning"
            title="No settlement conduit configured"
            message="A settlement conduit seller must be set before USDT settlements can be logged. Go to Sellers, open the row menu on a seller, and choose &ldquo;Set as Settlement Conduit&rdquo;."
            action={{
              label: "Go to Sellers",
              onClick: () => router.push("/admin/sellers"),
            }}
          />
        )}

        <div className="space-y-1.5">
          <Label htmlFor="settlement-seller">External Seller</Label>
          <SearchableSelect
            id="settlement-seller"
            value={effectiveSellerId}
            onChange={setSellerId}
            searchPlaceholder="Search sellers..."
            options={externalSellers.map((s) => ({
              value: s.id,
              label: `${s.flag} ${s.name}`,
              sublabel: `${(sellerUsdtDues[s.id] ?? 0).toLocaleString()} USDT owed`,
            }))}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="settlement-date">Settlement Date</Label>
            <Input
              id="settlement-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <p className="text-[11px] text-slate-400">
              The USDT rate for this date must already be on file (Rates screen).
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="settlement-usdt">USDT Amount Fronted</Label>
            <Input
              id="settlement-usdt"
              type="number"
              min="0"
              value={usdtAmount}
              onChange={(e) => setUsdtAmount(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="settlement-payer">Fronted By</Label>
          <Input
            id="settlement-payer"
            value={
              conduitSeller
                ? `${conduitSeller.name} (Settlement Conduit)`
                : "Not configured yet"
            }
            disabled
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="settlement-note">Tx hash / note</Label>
          <Input
            id="settlement-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional"
          />
        </div>

        {exceedsOutstanding && selectedSeller ? (
          <Alert
            variant="error"
            title="Settlement exceeds outstanding USDT due"
            message={`${selectedSeller.name} is currently owed ${maxSettleable.toLocaleString()} USDT. This settlement is over by ${(preview?.unallocated_usdt ?? 0).toLocaleString()} USDT, which has no open trade to settle against.`}
            action={{
              label: `Use maximum (${maxSettleable.toLocaleString()} USDT)`,
              onClick: () => setUsdtAmount(String(maxSettleable)),
            }}
          />
        ) : null}

        {selectedSeller && numAmount ? (
          <div className="space-y-2 rounded-xl bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold tracking-wide text-slate-500 uppercase">
                FIFO Allocation Preview
              </p>
              {isOverridden && (
                <button
                  type="button"
                  className="text-[11px] font-semibold text-brand-600 underline"
                  onClick={() => setOverrides(null)}
                >
                  Reset to FIFO
                </button>
              )}
            </div>
            {previewLoading ? (
              <p className="text-xs text-slate-400">Loading open trades…</p>
            ) : rows.length === 0 ? (
              <p className="text-xs text-slate-400">
                {selectedSeller.name} has no open (unsettled) trades.
              </p>
            ) : (
              <div className="space-y-1.5">
                {rows.map((r) => (
                  <div
                    key={r.transaction_id}
                    className="flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="font-mono text-slate-500">
                      Trade #{r.transaction_id}
                    </span>
                    <Input
                      type="number"
                      min="0"
                      value={r.allocated_usdt}
                      onChange={(e) => updateOverride(r.transaction_id, e.target.value)}
                      className="h-7 w-32 font-mono text-xs"
                    />
                    <span className="text-slate-400">USDT</span>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-xs font-semibold">
                  <span>Allocated Total</span>
                  <span
                    className={
                      allocationSumMatches ? "text-emerald-700" : "text-rose-600"
                    }
                  >
                    <Usdt value={allocatedTotal} /> / <Usdt value={numAmount} />
                  </span>
                </div>
                {!allocationSumMatches && (
                  <p className="text-[11px] text-rose-600">
                    Allocation must sum exactly to the settled amount.
                  </p>
                )}
              </div>
            )}
          </div>
        ) : null}

        <SubmitButton
          type="submit"
          className="w-full"
          disabled={
            !conduitSeller ||
            exceedsOutstanding ||
            (isOverridden && !allocationSumMatches)
          }
          isSubmitting={createSettlement.isPending}
          pendingLabel="Logging settlement…"
        >
          Log Settlement
        </SubmitButton>
      </form>
    </SectionCard>
  )
}
