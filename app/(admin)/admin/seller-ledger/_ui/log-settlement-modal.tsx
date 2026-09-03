"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { findConduitSeller, findConduitUsdtRate } from "@/lib/calc/rates"
import { useRates } from "@/features/use-rates"
import { useActiveSellers } from "@/features/use-sellers"
import { useCreateSettlement } from "@/features/use-settlements"
import { getErrorMessage } from "@/lib/handleError"
import { todayISO } from "@/lib/date"
import { useConfetti } from "@/hooks/use-confetti"
import { Modal } from "@/components/primitives/modal"
import { Alert } from "@/components/shared/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
import { SubmitButton } from "@/components/primitives/submit-button"
import { Bdt } from "@/components/primitives/money"

interface LogSettlementModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sellerId: number
  sellerName: string
}


export function LogSettlementModal({
  open,
  onOpenChange,
  sellerId,
  sellerName,
}: LogSettlementModalProps) {
  const router = useRouter()
  const { data: sellers = [] } = useActiveSellers()
  const [date, setDate] = React.useState(todayISO())
  const { data: rates = [] } = useRates({ date })
  const createSettlement = useCreateSettlement()
  const fireConfetti = useConfetti()

  const [usdtAmount, setUsdtAmount] = React.useState("")
  const [note, setNote] = React.useState("")

  const conduitSeller = findConduitSeller(sellers)
  const conduitName = conduitSeller?.name ?? "the settlement conduit"
  const previewRate = findConduitUsdtRate(rates, date, conduitSeller?.id)
  const previewBdt =
    previewRate && usdtAmount ? Number(usdtAmount) * previewRate : undefined

  // Which button was pressed, read inside the single submit handler. A ref
  // rather than state because it must be readable in the same tick.
  const keepOpenRef = React.useRef(false)
  const amountRef = React.useRef<HTMLInputElement>(null)
  const [savedCount, setSavedCount] = React.useState(0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const num = Number(usdtAmount)
    if (!num) return
    if (!conduitSeller) {
      toast.error("No settlement conduit is configured yet.")
      return
    }

    try {
      await createSettlement.mutateAsync({
        date,
        sellerId,
        usdtAmount: num,
        note: note || undefined,
      })
      fireConfetti()

      const total = savedCount + 1
      setSavedCount(total)
      toast.success(
        `${num.toLocaleString()} USDT settlement logged for ${sellerName}.` +
          (keepOpenRef.current && total > 1
            ? ` ${total} saved this session.`
            : "")
      )

      // The date stays put so a run of settlements on the same day needs no
      // re-picking; only the per-entry fields clear.
      setUsdtAmount("")
      setNote("")

      if (keepOpenRef.current) {
        amountRef.current?.focus()
      } else {
        onOpenChange(false)
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to log settlement."))
    } finally {
      keepOpenRef.current = false
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Log USDT Settlement"
      description={`Record USDT fronted to ${sellerName}.`}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {!conduitSeller && (
          <Alert
            variant="warning"
            title="No settlement conduit configured"
            message="A settlement conduit seller must be set before USDT settlements can be logged."
            action={{
              label: "Go to Sellers",
              onClick: () => {
                onOpenChange(false)
                router.push("/admin/sellers")
              },
            }}
          />
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="settlement-date">Date</Label>
            <DatePicker
              id="settlement-date"
              value={date}
              onChange={(value) => setDate(value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="settlement-amount">USDT Amount</Label>
            <Input
              ref={amountRef}
              id="settlement-amount"
              type="number"
              min="0"
              value={usdtAmount}
              onChange={(e) => setUsdtAmount(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="settlement-payer">Payer Conduit</Label>
          <Input
            id="settlement-payer"
            value={
              conduitSeller
                ? `${conduitName} (Owner / Settlement Conduit)`
                : "Not configured yet"
            }
            disabled
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="settlement-note">TRC20 tx hash / note</Label>
          <Input
            id="settlement-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional"
          />
        </div>

        {previewBdt !== undefined && (
          <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
            Immediate effect: {sellerName}&rsquo;s owed USDT drops by{" "}
            {usdtAmount}, and {conduitName}&rsquo;s BDT payable grows by{" "}
            <Bdt value={previewBdt} className="font-bold text-slate-900" />.
          </div>
        )}

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {/* Settlements are usually logged in a run, so the modal can stay
              open between them rather than being reopened each time. */}
          <SubmitButton
            type="submit"
            variant="outline"
            className="w-full"
            disabled={!conduitSeller}
            isSubmitting={createSettlement.isPending}
            pendingLabel="Logging…"
            onClick={() => {
              keepOpenRef.current = true
            }}
          >
            Save &amp; Continue
          </SubmitButton>
          <SubmitButton
            type="submit"
            className="w-full"
            disabled={!conduitSeller}
            isSubmitting={createSettlement.isPending}
            pendingLabel="Logging…"
            onClick={() => {
              keepOpenRef.current = false
            }}
          >
            Save &amp; Close
          </SubmitButton>
        </div>
      </form>
    </Modal>
  )
}
