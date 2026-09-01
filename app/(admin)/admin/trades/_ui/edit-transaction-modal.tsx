"use client"

import * as React from "react"
import { toast } from "sonner"

import type { Transaction } from "@/lib/types"
import { useUpdateTransaction } from "@/features/use-transactions"
import { getErrorMessage } from "@/lib/handleError"
import { Modal } from "@/components/primitives/modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SubmitButton } from "@/components/primitives/submit-button"

function EditTransactionForm({
  transaction,
  onDone,
}: {
  transaction: Transaction
  onDone: () => void
}) {
  const updateTransaction = useUpdateTransaction()
  const [usdAmount, setUsdAmount] = React.useState(String(transaction.usd_amount))
  const [notes, setNotes] = React.useState(transaction.notes ?? "")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const num = Number(usdAmount)
    if (!num) return

    try {
      await updateTransaction.mutateAsync({
        id: transaction.id,
        usdAmount: num,
        notes: notes || undefined,
      })
      toast.success(`Trade ${transaction.id} updated.`)
      onDone()
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update trade."))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="edit-trade-usd">USD Amount</Label>
        <Input
          id="edit-trade-usd"
          type="number"
          min="0"
          value={usdAmount}
          onChange={(e) => setUsdAmount(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="edit-trade-notes">Notes</Label>
        <Textarea
          id="edit-trade-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Optional"
        />
      </div>
      <SubmitButton
        type="submit"
        className="w-full"
        isSubmitting={updateTransaction.isPending}
        pendingLabel="Saving…"
      >
        Save Changes
      </SubmitButton>
    </form>
  )
}

export function EditTransactionModal({
  open,
  onOpenChange,
  transaction,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: Transaction | null
}) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Trade"
      description="Only the USD amount and notes can be changed after a trade is logged."
    >
      {transaction && (
        <EditTransactionForm
          key={transaction.id}
          transaction={transaction}
          onDone={() => onOpenChange(false)}
        />
      )}
    </Modal>
  )
}
