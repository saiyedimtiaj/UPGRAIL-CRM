"use client"

import * as React from "react"
import { toast } from "sonner"
import { AlertTriangle } from "lucide-react"

import { findRateValue } from "@/lib/calc/rates"
import { useRates, useUpsertRate, useRateImpactPreview } from "@/features/use-rates"
import { useActiveClients } from "@/features/use-clients"
import { getErrorMessage } from "@/lib/handleError"
import { useConfetti } from "@/hooks/use-confetti"
import { SectionCard } from "@/components/primitives/section-card"
import { RateInputRow } from "@/components/primitives/rate-input-row"
import { Skeleton } from "@/components/ui/skeleton"

function ClientRateRow({
  date,
  clientId,
  clientName,
  clientRegion,
  savedValue,
  draft,
  onDraftChange,
  onSaved,
}: {
  date: string
  clientId: number
  clientName: string
  clientRegion: string
  savedValue: number | undefined
  draft: string | undefined
  onDraftChange: (value: string) => void
  onSaved: () => void
}) {
  const upsertRate = useUpsertRate()
  const fireConfetti = useConfetti()

  const value = draft !== undefined ? draft : (savedValue?.toString() ?? "")
  const isDirty = draft !== undefined && Number(draft) !== savedValue



  const { data: impact } = useRateImpactPreview(
    isDirty && Number(draft)
      ? { date, partyType: "CLIENT", partyId: clientId, kind: "DIRECT", value: Number(draft) }
      : undefined
  )

  async function save() {
    const num = Number(value)
    if (!num) return
    try {
      await upsertRate.mutateAsync({
        date,
        partyType: "CLIENT",
        partyId: clientId,
        kind: "DIRECT",
        value: num,
      })
      fireConfetti()
      toast.success("Client rate saved — re-checking pending trades.")
      onSaved()
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save rate."))
    }
  }

  return (
    <div className="space-y-1">
      <RateInputRow
        label={clientName}
        hint={clientRegion}
        value={value}
        onChange={onDraftChange}
        onSave={save}
        isSaving={upsertRate.isPending}
      />
      {!!impact?.alreadyPricedCount && (
        <p className="flex items-center gap-1 pl-1 text-[10px] font-semibold text-amber-600">
          <AlertTriangle className="h-3 w-3 shrink-0" />
          Will re-price {impact.alreadyPricedCount} already-posted trade(s) for {clientName}.
        </p>
      )}
    </div>
  )
}

export function ClientRatesGrid({ date }: { date: string }) {
  const { data: rates = [], isPending: ratesPending } = useRates({ date })
  const { data: clients = [], isPending: clientsPending } = useActiveClients()

  const [drafts, setDrafts] = React.useState<Record<number, string>>({})

  function savedFor(clientId: number): number | undefined {
    return findRateValue(rates, {
      date,
      party_type: "CLIENT",
      party_id: clientId,
      kind: "DIRECT",
    })
  }

  return (
    <SectionCard
      title="Agency & Brand Direct Selling Rates (BDT/USD)"
      subtitle="What each client pays the business per USD sourced"
    >
      <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        {ratesPending || clientsPending
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-lg" />
            ))
          : clients.map((client) => (
              <ClientRateRow
                key={client.id}
                date={date}
                clientId={client.id}
                clientName={client.name}
                clientRegion={client.region}
                savedValue={savedFor(client.id)}
                draft={drafts[client.id]}
                onDraftChange={(v) => setDrafts((prev) => ({ ...prev, [client.id]: v }))}
                onSaved={() =>
                  setDrafts((prev) => {
                    const next = { ...prev }
                    delete next[client.id]
                    return next
                  })
                }
              />
            ))}
      </div>
    </SectionCard>
  )
}
