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
import { Button } from "@/components/ui/button"
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
      toast.success(
        `${num.toLocaleString()} USDT settlement logged for ${sellerName}.`
      )

      setUsdtAmount("")
      setNote("")
      onOpenChange(false)
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to log settlement."))
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
            <Input
              id="settlement-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="settlement-amount">USDT Amount</Label>
            <Input
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

        <Button type="submit" className="w-full" disabled={!conduitSeller}>
          Log Settlement
        </Button>
      </form>
    </Modal>
  )
}
