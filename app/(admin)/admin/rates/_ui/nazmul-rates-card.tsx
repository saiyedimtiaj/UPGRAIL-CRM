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

export function NazmulRatesCard({ date }: { date: string }) {
  const { data: rates = [] } = useRates({ date })
  const { data: sellers = [] } = useActiveSellers()
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

  // Re-syncs from the loaded rate without an effect: whenever the saved
  // value changes (new date, or the query resolving), the draft is reset
  // during render rather than in a subsequent effect pass.
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
        <RateInputRow
          tone="dark"
          label="Conduit USDT Rate"
          hint="৳ per USDT — used to price same-day conduit trades and seller settlements"
          value={usdt}
          onChange={setUsdt}
          onSave={() => save(usdt)}
          disabled={!conduitSeller}
        />
        {!!impact?.alreadyPricedCount && (
          <Alert
            variant="warning"
            title={`This will re-price ${impact.alreadyPricedCount} already-finalized trade(s)`}
            message={impact.note ?? "Saving will recompute these trades."}
          />
        )}
      </div>
    </SectionCard>
  )
}
