"use client"

import * as React from "react"
import { toast } from "sonner"

import { useActiveClients } from "@/features/use-clients"
import { useActiveSellers } from "@/features/use-sellers"
import { useRates } from "@/features/use-rates"
import { useCreateTransaction } from "@/features/use-transactions"
import { getErrorMessage } from "@/lib/handleError"
import { todayISO } from "@/lib/date"
import { useConfetti } from "@/hooks/use-confetti"
import { findConduitUsdtRate, findRateValue } from "@/lib/calc/rates"
import { Bdt } from "@/components/primitives/money"
import { SectionCard } from "@/components/primitives/section-card"
import { ClientCombobox } from "@/components/primitives/client-combobox"
import { SellerCombobox } from "@/components/primitives/seller-combobox"
import { TradePreviewStrip } from "@/app/(admin)/admin/trades/_ui/trade-preview-strip"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export function TradeEntryForm() {
  const { data: clients = [] } = useActiveClients()
  const { data: sellers = [] } = useActiveSellers()
  const [date, setDate] = React.useState(todayISO())
  const { data: rates = [] } = useRates({ date })
  const createTransaction = useCreateTransaction()
  const fireConfetti = useConfetti()

  const [clientId, setClientId] = React.useState<number | undefined>(undefined)
  const [sellerId, setSellerId] = React.useState<number | undefined>(undefined)
  const [usdAmount, setUsdAmount] = React.useState("")
  const [cardRateInput, setCardRateInput] = React.useState("")
  const [clientRateInput, setClientRateInput] = React.useState("")
  const [notes, setNotes] = React.useState("")

  const selectedSeller = sellers.find((s) => s.id === sellerId)
  const conduitUsdtRate = selectedSeller?.isSettlementConduit
    ? findConduitUsdtRate(rates, date, selectedSeller.id)
    : undefined

  const clientRate =
    Number(clientRateInput) ||
    (clientId
      ? findRateValue(rates, {
          date,
          party_type: "CLIENT",
          party_id: clientId,
          kind: "DIRECT",
        })
      : undefined)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amount = Number(usdAmount)
    const cardRate = Number(cardRateInput)
    if (!clientId || !sellerId || !amount || !cardRate) {
      toast.error("Client, seller, USD amount, and Card Rate are all required.")
      return
    }

    try {
      const created = await createTransaction.mutateAsync({
        clientId,
        sellerId,
        usdAmount: amount,
        cardRate,
        date,
        clientRate: clientRateInput ? Number(clientRateInput) : undefined,
        notes: notes || undefined,
      })

      if (created.profit_status === "FINALIZED") {
        fireConfetti()
        toast.success("Trade logged and finalized.")
      } else if (created.profit_status === "PENDING_UNSETTLED") {
        toast.info(
          "Trade logged — profit stays pending until Nazmul settles this seller."
        )
      } else {
        toast.info(
          "Trade logged as pending — the conduit's daily rate isn't in yet."
        )
      }

      setClientId(undefined)
      setSellerId(undefined)
      setUsdAmount("")
      setCardRateInput("")
      setClientRateInput("")
      setNotes("")
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to log trade."))
    }
  }

  return (
    <SectionCard
      title="Quick Trade Entry Form"
      action={
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-36 sm:w-40"
        />
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label>Client</Label>
            <ClientCombobox
              clients={clients}
              value={clientId}
              onChange={setClientId}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Seller / Sourcing Desk</Label>
            <SellerCombobox
              sellers={sellers}
              value={sellerId}
              onChange={setSellerId}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="usd-amount">USD Amount</Label>
            <Input
              id="usd-amount"
              type="number"
              min="0"
              value={usdAmount}
              onChange={(e) => setUsdAmount(e.target.value)}
              placeholder="5000"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="card-rate">Card Rate (%)</Label>
            <Input
              id="card-rate"
              type="number"
              step="0.01"
              min="0"
              value={cardRateInput}
              onChange={(e) => setCardRateInput(e.target.value)}
              placeholder="e.g. 92.00"
              required
            />
          </div>
        </div>

        {selectedSeller && (
          <div className="space-y-3 rounded-xl bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] font-bold tracking-wide text-slate-500 uppercase">
                Client Rate (Optional Override)
              </p>
              {selectedSeller.isSettlementConduit && (
                <span className="font-mono text-[11px] text-slate-500">
                  Today&rsquo;s Conduit USDT Rate:{" "}
                  <Bdt value={conduitUsdtRate} />
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="client-rate">Client Rate (BDT/USD)</Label>
                <Input
                  id="client-rate"
                  type="number"
                  step="0.01"
                  value={clientRateInput}
                  onChange={(e) => setClientRateInput(e.target.value)}
                  placeholder={clientRate ? String(clientRate) : "e.g. 125.80"}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional note"
                />
              </div>
            </div>
            {!selectedSeller.isSettlementConduit && (
              <p className="text-[11px] text-slate-500">
                This is an external seller — profit stays pending until Nazmul
                actually settles them (spec §6.3), regardless of today&rsquo;s
                rates.
              </p>
            )}
          </div>
        )}

        {selectedSeller && usdAmount && cardRateInput && (
          <TradePreviewStrip
            usdAmount={Number(usdAmount) || 0}
            cardRate={Number(cardRateInput) || 0}
            isConduit={selectedSeller.isSettlementConduit}
            clientRate={clientRate}
            conduitUsdtRate={conduitUsdtRate}
          />
        )}

        <Button type="submit" className="w-full sm:w-auto">
          Log Trade
        </Button>
      </form>
    </SectionCard>
  )
}
