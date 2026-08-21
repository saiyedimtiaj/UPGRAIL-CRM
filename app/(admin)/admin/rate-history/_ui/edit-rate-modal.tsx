"use client"

import * as React from "react"
import { toast } from "sonner"

import type { DailyRate } from "@/lib/types"
import { useUpsertRate, useRateImpactPreview } from "@/features/use-rates"
import { getErrorMessage } from "@/lib/handleError"
import { Modal } from "@/components/primitives/modal"
import { Alert } from "@/components/shared/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"


function EditRateForm({ rate, onDone }: { rate: DailyRate; onDone: () => void }) {
  const upsertRate = useUpsertRate()
  const [value, setValue] = React.useState(String(rate.value))

  const numValue = Number(value)
  const isDirty = numValue !== rate.value
  const { data: impact } = useRateImpactPreview(
    isDirty && numValue
      ? {
          date: rate.date,
          partyType: rate.party_type,
          partyId: rate.party_id,
          kind: rate.kind,
          value: numValue,
        }
      : undefined
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const num = Number(value)
    if (!num) return

    try {
      await upsertRate.mutateAsync({
        date: rate.date,
        partyType: rate.party_type,
        partyId: rate.party_id,
        kind: rate.kind,
        value: num,
        reason: "Rate edited from Rate History",
      })
      toast.success("Rate updated.")
      onDone()
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update rate."))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="edit-rate-value">
          {rate.kind === "CARD" ? "Rate (%)" : "Rate (BDT)"}
        </Label>
        <Input
          id="edit-rate-value"
          type="number"
          step="0.01"
          min="0"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
        />
      </div>
      {!!impact?.alreadyPricedCount && (
        <Alert
          variant="warning"
          title={`This will re-price ${impact.alreadyPricedCount} already-priced trade(s)`}
          message={impact.note ?? "Saving will recompute these trades."}
        />
      )}
      <Button type="submit" className="w-full">
        Save Changes
      </Button>
    </form>
  )
}

export function EditRateModal({
  open,
  onOpenChange,
  rate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  rate: DailyRate | null
}) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Rate"
      description={
        rate
          ? `Update the ${rate.kind.toUpperCase()} rate for ${rate.date}. This re-runs auto-finalization for any affected pending trades.`
          : undefined
      }
    >
      {rate && (
        <EditRateForm key={rate.id} rate={rate} onDone={() => onOpenChange(false)} />
      )}
    </Modal>
  )
}
