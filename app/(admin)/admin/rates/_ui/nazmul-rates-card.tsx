"use client"

import * as React from "react"
import { toast } from "sonner"

import { findRateValue, findConduitSeller } from "@/lib/calc/rates"
import { useRates, useUpsertRate, useRateImpactPreview } from "@/features/use-rates"
import { useActiveSellers } from "@/features/use-sellers"
import { getErrorMessage } from "@/lib/handleError"
import { useConfetti } from "@/hooks/use-confetti"
import { SectionCard } from "@/components/primitives/section-card"
import { RateInputRow } from "@/components/primitives/rate-input-row"
import { Alert } from "@/components/shared/alert"
import { Skeleton } from "@/components/ui/skeleton"

export function NazmulRatesCard({ date }: { date: string }) {
  const { data: rates = [], isPending: ratesPending } = useRates({ date })
  const { data: sellers = [], isPending: sellersPending } = useActiveSellers()
  const upsertRate = useUpsertRate()
  const fireConfetti = useConfetti()

  const conduitSeller = findConduitSeller(sellers)

  const savedUsdt = conduitSeller
    ? findRateValue(rates, {
        date,
        party_type: "SELLER",
        party_id: conduitSeller.id,
        kind: "USDT",
      })
    : undefined



  const [usdt, setUsdt] = React.useState(savedUsdt?.toString() ?? "")
  const [syncedFor, setSyncedFor] = React.useState(savedUsdt)
  if (syncedFor !== savedUsdt) {
    setSyncedFor(savedUsdt)
    setUsdt(savedUsdt?.toString() ?? "")
  }

  const { data: impact } = useRateImpactPreview(
    conduitSeller
      ? {
          date,
          partyType: "SELLER",
          partyId: conduitSeller.id,
          kind: "USDT",
          value: Number(usdt) || 0,
        }
      : undefined
  )

  async function save(value: string) {
    const num = Number(value)
    if (!num || !conduitSeller) return
    try {
      await upsertRate.mutateAsync({
        date,
        partyType: "SELLER",
        partyId: conduitSeller.id,
        kind: "USDT",
        value: num,
      })
      fireConfetti()
      toast.success(
        `${conduitSeller.name}'s USDT settlement rate saved — re-checking pending trades.`
      )
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save rate."))
    }
  }

  return (
    <SectionCard
      variant="dark"
      title={
        conduitSeller
          ? `${conduitSeller.name} Settlement Conduit Rate`
          : "Settlement Conduit Rate"
      }
      subtitle={
        conduitSeller
          ? "USDT rate used for same-day conduit trades and USDT settlements"
          : "No settlement-conduit seller configured yet — set one on the Sellers screen."
      }
    >
      <div className="space-y-4">
        {ratesPending || sellersPending ? (
          <Skeleton className="h-10 rounded-lg" />
        ) : (
          <>
            {/* The rate is the point of this card, so show it as a figure
                first and an input second. */}
            <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <div>
                <div className="font-mono text-[10px] tracking-[0.16em] text-sky-300/80 uppercase">
                  Today&rsquo;s Conduit Rate
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="font-mono text-4xl font-bold tracking-tight tabular-nums text-white">
                    {savedUsdt ? `৳${savedUsdt}` : "—"}
                  </span>
                  <span className="text-sm font-medium text-zinc-400">
                    / USDT
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[10px] tracking-[0.16em] text-zinc-500 uppercase">
                  Status
                </div>
                <div
                  className={
                    savedUsdt
                      ? "mt-1 text-sm font-semibold text-emerald-400"
                      : "mt-1 text-sm font-semibold text-amber-400"
                  }
                >
                  {savedUsdt ? "Rate on file" : "Not set for today"}
                </div>
              </div>
            </div>

            <RateInputRow
              tone="dark"
              label="Conduit USDT Rate"
              hint="৳ per USDT — used to price same-day conduit trades and seller settlements"
              value={usdt}
              onChange={setUsdt}
              onSave={() => save(usdt)}
              disabled={!conduitSeller}
              isSaving={upsertRate.isPending}
            />
            {!!impact?.alreadyPricedCount && (
              <Alert
                variant="warning"
                title={`This will re-price ${impact.alreadyPricedCount} already-finalized trade(s)`}
                message={impact.note ?? "Saving will recompute these trades."}
              />
            )}
          </>
        )}
      </div>
    </SectionCard>
  )
}
