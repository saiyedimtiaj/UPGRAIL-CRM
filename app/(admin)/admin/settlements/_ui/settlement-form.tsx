"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { findConduitSeller } from "@/lib/calc/rates"
import { useActiveSellers } from "@/features/use-sellers"
import {
  useCreateSettlement,
  useCreateTransfer,
  usePreviewAllocation,
  usePreviewTransfer,
} from "@/features/use-settlements"
import { getErrorMessage } from "@/lib/handleError"
import { todayISO } from "@/lib/date"
import { useConfetti } from "@/hooks/use-confetti"
import { useBalances } from "@/features/use-analytics"
import { SectionCard } from "@/components/primitives/section-card"
import { SearchableSelect } from "@/components/primitives/searchable-select"
import { Alert } from "@/components/shared/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
import { SubmitButton } from "@/components/primitives/submit-button"
import { Usdt } from "@/components/primitives/money"
import type { AllocationOverride } from "@/services/settlements.api"

/**
 * Two different events, deliberately not merged into one form.
 *
 * A supplier settlement spends BDT at that day's rate, so it needs a rate and
 * it finalizes profit. One seller covering another spends nothing: it moves
 * who owes the USDT and nothing else, so it has no rate field at all. Showing
 * a rate there would invite recording a cost that was never paid.
 */
type SettlementMode = "supplier" | "transfer"

/**
 * A seller's USDT balance can be positive (owed), zero (paid), or negative
 * (they hold credit from an over-settlement) — never shown as a raw negative
 * number, which reads as an error rather than an advance.
 */
function usdtDueLabel(balance: number): string {
  if (balance > 0) return `${balance.toLocaleString()} USDT owed`
  if (balance < 0) return `${Math.abs(balance).toLocaleString()} USDT advance`
  return "Paid"
}

export function SettlementForm() {
  const router = useRouter()
  const [mode, setMode] = React.useState<SettlementMode>("supplier")
  const { data: sellers = [] } = useActiveSellers()
  const { data: balances } = useBalances()
  const sellerUsdtDues = balances?.sellerUsdtDues ?? {}
  const createSettlement = useCreateSettlement()
  const createTransfer = useCreateTransfer()
  const fireConfetti = useConfetti()

  const conduitSeller = findConduitSeller(sellers)

  const externalSellers = sellers.filter((s) => !s.isSettlementConduit)

  // Sellers arrive from a query, so the first render has none. The initial
  // value alone would latch undefined forever and leave the form with no
  // seller selected — fall back to the first external seller once they load.
  const [sellerId, setSellerId] = React.useState<number | undefined>(undefined)
  const effectiveSellerId = sellerId ?? externalSellers[0]?.id
  // Any seller may front a settlement; the conduit is only the usual one.
  const [payerId, setPayerId] = React.useState<number | undefined>(undefined)
  const effectivePayerId = payerId ?? conduitSeller?.id

  const [date, setDate] = React.useState(todayISO())
  const [usdtAmount, setUsdtAmount] = React.useState("")
  const [note, setNote] = React.useState("")
  const [overrides, setOverrides] = React.useState<Record<number, string> | null>(null)

  const numAmount = Number(usdtAmount) || undefined
  const isTransfer = mode === "transfer"

  const { data: preview, isFetching: previewLoading } = usePreviewAllocation(
    isTransfer ? undefined : effectiveSellerId,
    numAmount
  )
  // In transfer mode the payee is the seller being paid off, so the preview
  // walks THEIR obligations — the opposite direction from a settlement.
  const { data: transferPreview, isFetching: transferPreviewLoading } =
    usePreviewTransfer(isTransfer ? effectiveSellerId : undefined, numAmount)
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

    if (isTransfer) {
      if (!effectivePayerId) {
        toast.error("Select which seller is taking the obligation over.")
        return
      }
      if (effectivePayerId === effectiveSellerId) {
        toast.error("A seller cannot take over their own obligation.")
        return
      }
      try {
        await createTransfer.mutateAsync({
          date,
          fromSellerId: effectiveSellerId,
          toSellerId: effectivePayerId,
          usdtAmount: num,
          note: note || undefined,
        })
        fireConfetti()
        toast.success(
          `${num.toLocaleString()} USDT obligation moved. No profit finalized — that waits for the supplier payment.`
        )
        setUsdtAmount("")
        setNote("")
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to record the transfer."))
      }
      return
    }

    if (!conduitSeller) {
      toast.error("No settlement conduit is configured yet.")
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
        paidBy: effectivePayerId,
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
    <SectionCard
      title={
        isTransfer
          ? "Seller Pays Another Seller (Obligation Transfer)"
          : "Settle External Seller (USDT Allocation)"
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div
          role="radiogroup"
          aria-label="Settlement type"
          className="grid grid-cols-1 gap-2 sm:grid-cols-2"
        >
          {(
            [
              {
                value: "supplier" as const,
                title: "Primary Supplier settlement",
                blurb: "BDT is paid at today's rate. Finalizes profit.",
              },
              {
                value: "transfer" as const,
                title: "Seller pays another seller",
                blurb: "Moves who owes the USDT. No rate, no profit yet.",
              },
            ] satisfies { value: SettlementMode; title: string; blurb: string }[]
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={mode === option.value}
              onClick={() => setMode(option.value)}
              className={
                mode === option.value
                  ? "cursor-pointer rounded-xl border border-emerald-300 bg-emerald-50/60 p-3 text-left ring-1 ring-emerald-200"
                  : "cursor-pointer rounded-xl border border-slate-200 bg-white p-3 text-left hover:border-slate-300"
              }
            >
              <span className="block text-xs font-bold text-slate-900">
                {option.title}
              </span>
              <span className="mt-0.5 block text-[11px] text-slate-500">
                {option.blurb}
              </span>
            </button>
          ))}
        </div>

        {!conduitSeller && !isTransfer && (
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
          <Label htmlFor="settlement-seller">
            {isTransfer ? "Seller Being Paid Off" : "External Seller"}
          </Label>
          <SearchableSelect
            id="settlement-seller"
            value={effectiveSellerId}
            onChange={setSellerId}
            searchPlaceholder="Search sellers..."
            options={externalSellers.map((s) => ({
              value: s.id,
              label: `${s.flag} ${s.name}`,
              sublabel: usdtDueLabel(sellerUsdtDues[s.id] ?? 0),
            }))}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="settlement-date">Settlement Date</Label>
            <DatePicker
              id="settlement-date"
              value={date}
              onChange={(value) => setDate(value)}
            />
            <p className="text-[11px] text-slate-400">
              {isTransfer
                ? "No rate needed — nothing is bought here, the liability just moves."
                : "The USDT rate for this date must already be on file (Rates screen)."}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="settlement-usdt">
              {isTransfer ? "USDT Taken Over" : "USDT Amount Fronted"}
            </Label>
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
          <Label htmlFor={isTransfer ? "settlement-payer" : undefined}>
            {isTransfer ? "Seller Taking It Over" : "Fronted By"}
          </Label>
          {isTransfer ? (
            <SearchableSelect
              id="settlement-payer"
              value={effectivePayerId}
              onChange={setPayerId}
              options={externalSellers
                .filter((s) => s.id !== effectiveSellerId)
                .map((s) => ({
                  value: s.id,
                  label: `${s.flag ?? ""} ${s.name}`.trim(),
                  sublabel: `Currently ${usdtDueLabel(sellerUsdtDues[s.id] ?? 0).toLowerCase()}, plus this`,
                }))}
              searchPlaceholder="Search sellers..."
              placeholder="Select who paid"
            />
          ) : (
            // Always the settlement conduit — a supplier settlement is BDT
            // paid on the business's behalf, and there is only ever one
            // conduit at a time, so this has nothing to actually choose.
            <div className="flex h-10 items-center gap-2 rounded-lg border border-input bg-input/30 px-3 text-sm">
              {conduitSeller ? (
                <>
                  <span>{conduitSeller.flag}</span>
                  <span className="font-medium text-slate-700">{conduitSeller.name}</span>
                  <span className="ml-auto text-[11px] font-semibold text-slate-400 uppercase">
                    Settlement conduit
                  </span>
                </>
              ) : (
                <span className="text-slate-400">No settlement conduit configured</span>
              )}
            </div>
          )}
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

        {!isTransfer && exceedsOutstanding && selectedSeller ? (
          <Alert
            variant="info"
            title="This will create an advance"
            message={`${selectedSeller.name} is owed ${maxSettleable.toLocaleString()} USDT. The extra ${(preview?.unallocated_usdt ?? 0).toLocaleString()} USDT is held as credit and applied to their next trades.`}
            action={{
              label: `Settle exactly what is owed (${maxSettleable.toLocaleString()} USDT)`,
              onClick: () => setUsdtAmount(String(maxSettleable)),
            }}
          />
        ) : null}

        {isTransfer && selectedSeller && numAmount ? (
          <div className="space-y-2 rounded-xl border border-violet-200/70 bg-violet-50/40 p-4">
            <p className="text-[11px] font-bold tracking-wide text-violet-700 uppercase">
              Obligations Moving (FIFO)
            </p>
            {transferPreviewLoading ? (
              <p className="text-xs text-slate-400">Loading obligations…</p>
            ) : (transferPreview?.moves.length ?? 0) === 0 ? (
              <p className="text-xs text-slate-500">
                {selectedSeller.name} has nothing outstanding to take over.
              </p>
            ) : (
              <div className="space-y-1.5">
                {transferPreview?.moves.map((m) => (
                  <div
                    key={m.obligation_id}
                    className="flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="font-mono text-slate-500">
                      Trade #{m.transaction_id ?? "—"}
                    </span>
                    <span className="font-mono font-semibold text-slate-700">
                      <Usdt value={m.usdt_amount} />
                    </span>
                  </div>
                ))}
                <p className="border-t border-violet-200/70 pt-2 text-[11px] text-slate-600">
                  These stay unpaid — they just move to the other seller.
                  Profit finalizes when the Primary Supplier is paid.
                </p>
              </div>
            )}
            {(transferPreview?.unmoved_usdt ?? 0) > 0 && (
              <p className="text-[11px] font-semibold text-rose-600">
                {selectedSeller.name} only owes{" "}
                {(transferPreview?.max_transferable_usdt ?? 0).toLocaleString()}{" "}
                USDT — reduce the amount.
              </p>
            )}
          </div>
        ) : null}

        {!isTransfer && selectedSeller && numAmount ? (
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
            isTransfer
              ? (transferPreview?.unmoved_usdt ?? 0) > 0 ||
                effectivePayerId === effectiveSellerId
              : !conduitSeller || (isOverridden && !allocationSumMatches)
          }
          isSubmitting={
            isTransfer ? createTransfer.isPending : createSettlement.isPending
          }
          pendingLabel={
            isTransfer ? "Recording transfer…" : "Logging settlement…"
          }
        >
          {isTransfer ? "Record Obligation Transfer" : "Log Settlement"}
        </SubmitButton>
      </form>
    </SectionCard>
  )
}
