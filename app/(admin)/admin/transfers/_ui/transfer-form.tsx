"use client"

import * as React from "react"
import { toast } from "sonner"

import type { MoneyDestination } from "@/lib/types"
import { useCreateTransfer, useTransferPreview } from "@/features/use-transfers"
import { getErrorMessage } from "@/lib/handleError"
import { useConfetti } from "@/hooks/use-confetti"
import { SectionCard } from "@/components/primitives/section-card"
import { SelectField } from "@/components/primitives/select-field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Bdt } from "@/components/primitives/money"

const DESTINATION_OPTIONS = [
  { value: "NAZMUL", label: "Nazmul" },
  { value: "UPGRAIL_BANK", label: "UpGrail Bank" },
  { value: "PROFIT_BANK", label: "Profit Bank" },
]

export function TransferForm() {
  const createTransfer = useCreateTransfer()
  const fireConfetti = useConfetti()

  const [from, setFrom] = React.useState<MoneyDestination>("UPGRAIL_BANK")
  const [to, setTo] = React.useState<MoneyDestination>("NAZMUL")
  const [amount, setAmount] = React.useState("")
  const [reference, setReference] = React.useState("")
  const [note, setNote] = React.useState("")
  const [reason, setReason] = React.useState("")

  const numAmount = Number(amount) || undefined
  const { data: preview, isFetching: previewLoading } = useTransferPreview(from, to, numAmount)

  const needsReason = from === "PROFIT_BANK" && to === "UPGRAIL_BANK"
  const sameDestination = from === to

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const num = Number(amount)
    if (!num || sameDestination) return
    if (needsReason && !reason.trim()) {
      toast.error("A reason is required when reversing money out of Profit Bank.")
      return
    }

    try {
      await createTransfer.mutateAsync({
        fromDestination: from,
        toDestination: to,
        amountBdt: num,
        reference: reference || undefined,
        note: note || undefined,
        reason: needsReason ? reason.trim() : undefined,
      })
      fireConfetti()
      toast.success(`৳${num.toLocaleString()} transferred.`)
      setAmount("")
      setReference("")
      setNote("")
      setReason("")
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to record transfer."))
    }
  }

  return (
    <SectionCard title="Transfer Money">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="transfer-from">From</Label>
            <SelectField
              id="transfer-from"
              value={from}
              onChange={(v) => setFrom(v as MoneyDestination)}
              options={DESTINATION_OPTIONS}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="transfer-to">To</Label>
            <SelectField
              id="transfer-to"
              value={to}
              onChange={(v) => setTo(v as MoneyDestination)}
              options={DESTINATION_OPTIONS}
            />
          </div>
        </div>

        {sameDestination && (
          <p className="text-[11px] font-semibold text-rose-600">
            From and To must be different destinations.
          </p>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="transfer-amount">Amount (BDT)</Label>
          <Input
            id="transfer-amount"
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="transfer-reference">Reference</Label>
            <Input
              id="transfer-reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Optional — bank ref, tx hash..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="transfer-note">Note</Label>
            <Input
              id="transfer-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>

        {needsReason && (
          <div className="space-y-1.5">
            <Label htmlFor="transfer-reason">Reason (required for Profit Bank reversal)</Label>
            <Input
              id="transfer-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is profit being moved back to UpGrail Bank?"
              required
            />
          </div>
        )}

        {!sameDestination && numAmount ? (
          <div className="rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
            <p className="mb-1 text-[11px] font-bold tracking-wide text-slate-500 uppercase">
              Ledger Effect Preview
            </p>
            {previewLoading ? (
              <p className="text-slate-400">Calculating…</p>
            ) : preview ? (
              <div className="space-y-0.5">
                <p>
                  Nazmul Due changes by{" "}
                  <Bdt value={preview.nazmul_due_change} className="font-bold text-slate-900" />
                </p>
                <p>
                  UpGrail Reserve changes by{" "}
                  <Bdt value={preview.upgrail_reserve_change} className="font-bold text-slate-900" />
                </p>
                <p>
                  Profit Remaining changes by{" "}
                  <Bdt value={preview.profit_remaining_change} className="font-bold text-slate-900" />
                </p>
                <p>
                  Profit Taken Out changes by{" "}
                  <Bdt value={preview.profit_taken_out_change} className="font-bold text-slate-900" />
                </p>
              </div>
            ) : (
              <p className="text-slate-400">Enter a route and amount to preview.</p>
            )}
          </div>
        ) : null}

        <Button
          type="submit"
          className="w-full"
          disabled={sameDestination || createTransfer.isPending}
        >
          Transfer Funds
        </Button>
      </form>
    </SectionCard>
  )
}
