"use client"

import * as React from "react"
import { toast } from "sonner"

import { useMetrics } from "@/features/use-analytics"
import { useCreateTransfer, useTransferPreview } from "@/features/use-transfers"
import { getErrorMessage } from "@/lib/handleError"
import { useConfetti } from "@/hooks/use-confetti"
import { SectionCard } from "@/components/primitives/section-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Bdt } from "@/components/primitives/money"

export function WithdrawalForm() {
  const { data: metrics } = useMetrics()
  const createTransfer = useCreateTransfer()
  const fireConfetti = useConfetti()

  const [amount, setAmount] = React.useState("")
  const [note, setNote] = React.useState("")

  const profitRemaining = metrics?.profitRemaining ?? 0
  const numAmount = Number(amount) || undefined
  const { data: preview } = useTransferPreview("UPGRAIL_BANK", "PROFIT_BANK", numAmount)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const num = Number(amount)
    if (!num || !note.trim()) return

    if (num > profitRemaining) {
      toast.error("Amount exceeds Profit Remaining.")
      return
    }

    try {
      await createTransfer.mutateAsync({
        fromDestination: "UPGRAIL_BANK",
        toDestination: "PROFIT_BANK",
        amountBdt: num,
        note: note.trim(),
      })
      fireConfetti()
      toast.success(`৳${num.toLocaleString()} taken out to Profit Bank.`)
      setAmount("")
      setNote("")
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to record the transfer."))
    }
  }

  return (
    <SectionCard title="Take Out Profit">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="withdrawal-amount">Amount (BDT)</Label>
          <Input
            id="withdrawal-amount"
            type="number"
            min="0"
            max={profitRemaining}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <p className="text-[11px] text-slate-400">
            Max available: ৳{profitRemaining.toLocaleString()}
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="withdrawal-note">Reason / Note</Label>
          <Input
            id="withdrawal-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            required
            placeholder="e.g. Owner dividend split"
          />
        </div>
        {preview && (
          <div className="rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
            <p className="mb-1 text-[11px] font-bold tracking-wide text-slate-500 uppercase">
              Ledger Effect Preview
            </p>
            <p>
              Profit Remaining changes by{" "}
              <Bdt value={preview.profit_remaining_change} className="font-bold text-slate-900" />
              , Profit Taken Out changes by{" "}
              <Bdt value={preview.profit_taken_out_change} className="font-bold text-slate-900" />
              , UpGrail Reserve changes by{" "}
              <Bdt value={preview.upgrail_reserve_change} className="font-bold text-slate-900" />.
            </p>
          </div>
        )}
        <Button
          type="submit"
          disabled={profitRemaining <= 0 || createTransfer.isPending}
          className="w-full"
        >
          Take Out Profit
        </Button>
      </form>
    </SectionCard>
  )
}
