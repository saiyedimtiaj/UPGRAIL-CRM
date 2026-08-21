"use client"

import * as React from "react"
import { toast } from "sonner"

import type { USDTSettlement } from "@/lib/types"
import { useUpdateSettlement } from "@/features/use-settlements"
import { getErrorMessage } from "@/lib/handleError"
import { Modal } from "@/components/primitives/modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"


function EditSettlementForm({
  settlement,
  onDone,
}: {
  settlement: USDTSettlement
  onDone: () => void
}) {
  const updateSettlement = useUpdateSettlement()
  const [note, setNote] = React.useState(settlement.note ?? "")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      await updateSettlement.mutateAsync({
        id: settlement.id,
        note: note || undefined,
      })
      toast.success(`Settlement ${settlement.id} updated.`)
      onDone()
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update settlement."))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-xs text-slate-500">
        Settlement amounts and allocations are immutable once created (spec
        §17.2) — void the settlement instead if it was entered in error. Only
        the note can be edited here.
      </p>
      <div className="space-y-1.5">
        <Label htmlFor="edit-settlement-note">TRC20 tx hash / note</Label>
        <Input
          id="edit-settlement-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional"
        />
      </div>
      <Button type="submit" className="w-full">
        Save Changes
      </Button>
    </form>
  )
}


export function EditSettlementModal({
  open,
  onOpenChange,
  settlement,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  settlement: USDTSettlement | null
}) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Settlement"
      description="Update the USDT amount or note for this settlement."
    >
      {settlement && (
        <EditSettlementForm
          key={settlement.id}
          settlement={settlement}
          onDone={() => onOpenChange(false)}
        />
      )}
    </Modal>
  )
}
