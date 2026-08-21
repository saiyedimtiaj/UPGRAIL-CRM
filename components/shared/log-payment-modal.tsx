"use client"

import * as React from "react"
import { toast } from "sonner"

import type { MoneyDestination, Payment, PaymentPartyType } from "@/lib/types"
import { todayISO } from "@/lib/date"
import { useActiveClients } from "@/features/use-clients"
import { useActiveSellers } from "@/features/use-sellers"
import { useCreatePayment, useUpdatePayment } from "@/features/use-payments"
import { useSettings } from "@/features/use-settings"
import { getErrorMessage } from "@/lib/handleError"
import { useConfetti } from "@/hooks/use-confetti"
import { Modal } from "@/components/primitives/modal"
import { SelectField } from "@/components/primitives/select-field"
import { ClientCombobox } from "@/components/primitives/client-combobox"
import { SellerCombobox } from "@/components/primitives/seller-combobox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface LogPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  partyType?: PaymentPartyType
  partyId?: number
  partyName?: string
  mode?: "create" | "edit"
  initial?: Payment
}

function PaymentForm({
  fixedPartyType,
  fixedPartyId,
  fixedPartyName,
  mode,
  initial,
  todayISO: today,
  onDone,
}: {
  fixedPartyType?: PaymentPartyType
  fixedPartyId?: number
  fixedPartyName?: string
  mode: "create" | "edit"
  initial?: Payment
  todayISO: string
  onDone: () => void
}) {
  const { data: clients = [] } = useActiveClients()
  const { data: sellers = [] } = useActiveSellers()
  const { data: settings, isPending: settingsPending } = useSettings()
  const createPayment = useCreatePayment()
  const updatePayment = useUpdatePayment()
  const fireConfetti = useConfetti()

  const paymentMethods = settings?.paymentMethods ?? []

  const isFreeParty = !fixedPartyType
  const isEdit = mode === "edit" && !!initial

  const [partyType, setPartyType] = React.useState<PaymentPartyType>(
    initial?.party_type ?? fixedPartyType ?? "CLIENT"
  )
  const [partyId, setPartyId] = React.useState<number | undefined>(
    initial?.party_id ?? fixedPartyId
  )
  const [amount, setAmount] = React.useState(
    initial ? String(initial.amount) : ""
  )
  const [date, setDate] = React.useState(initial?.date ?? today)
  const [direction, setDirection] = React.useState<"IN" | "OUT">(
    initial?.direction ?? ((fixedPartyType ?? "CLIENT") === "CLIENT" ? "IN" : "OUT")
  )
  const [methodTouched, setMethodTouched] = React.useState(false)
  const [rawMethod, setRawMethod] = React.useState<string>(initial?.method ?? "")
  const [note, setNote] = React.useState(initial?.note ?? "")
  const [destination, setDestination] = React.useState<MoneyDestination>(
    initial?.destination ?? "UPGRAIL_BANK"
  )


  const method = methodTouched ? rawMethod : rawMethod || settings?.defaultPaymentMethod || ""
  function setMethod(value: string) {
    setMethodTouched(true)
    setRawMethod(value)
  }


  const paymentEligibleSellers = sellers

  const partyName =
    fixedPartyName ??
    (partyType === "CLIENT"
      ? clients.find((c) => c.id === partyId)?.name
      : sellers.find((s) => s.id === partyId)?.name) ??
    "this party"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const num = Number(amount)
    if (!num || !partyId) return

    try {
      if (isEdit && initial) {
        await updatePayment.mutateAsync({
          id: initial.id,
          amount: num,
          method,
          note: note || undefined,
        })
        toast.success(`Payment updated for ${partyName}.`)
      } else {
        await createPayment.mutateAsync({
          date,
          partyType,
          partyId,
          amount: num,
          direction,
          destination,
          method,
          note: note || undefined,
        })
        fireConfetti()
        toast.success(`Payment of ৳${num.toLocaleString()} logged for ${partyName}.`)
      }

      onDone()
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save payment."))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {isFreeParty && (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="payment-party-type">Party Type</Label>
            <SelectField
              id="payment-party-type"
              value={partyType}
              onChange={(v) => {
                const next = v as PaymentPartyType
                setPartyType(next)
                setPartyId(undefined)
                setDirection(next === "CLIENT" ? "IN" : "OUT")
              }}
              disabled={isEdit}
              options={[
                { value: "CLIENT", label: "Client" },
                { value: "DIRECT_SELLER", label: "Direct Seller" },
              ]}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="payment-party">
              {partyType === "CLIENT" ? "Client" : "Seller"}
            </Label>
            {partyType === "CLIENT" ? (
              <ClientCombobox
                id="payment-party"
                clients={clients}
                value={partyId}
                onChange={setPartyId}
                disabled={isEdit}
              />
            ) : (
              <SellerCombobox
                id="payment-party"
                sellers={paymentEligibleSellers}
                value={partyId}
                onChange={setPartyId}
                disabled={isEdit}
              />
            )}
          </div>
        </>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="payment-amount">Amount (BDT)</Label>
        <Input
          id="payment-amount"
          type="number"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="payment-date">Date</Label>
          <Input
            id="payment-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={isEdit}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="payment-direction">Direction</Label>
          <SelectField
            id="payment-direction"
            value={direction}
            onChange={(v) => setDirection(v as "IN" | "OUT")}
            disabled={isEdit}
            options={[
              { value: "IN", label: "IN (reduces balance)" },
              { value: "OUT", label: "OUT (increases balance)" },
            ]}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="payment-destination">Paid To</Label>
        <SelectField
          id="payment-destination"
          value={destination}
          onChange={(v) => setDestination(v as MoneyDestination)}
          disabled={isEdit}
          options={[
            { value: "UPGRAIL_BANK", label: "UpGrail Bank (reserve)" },
            { value: "NAZMUL", label: "Nazmul (settlement conduit)" },
            { value: "PROFIT_BANK", label: "Profit Bank" },
          ]}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="payment-method">Method</Label>
        <SelectField
          id="payment-method"
          value={method}
          onChange={setMethod}
          disabled={settingsPending}
          options={paymentMethods.map((m) => ({ value: m, label: m }))}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="payment-note">Note</Label>
        <Input
          id="payment-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional"
        />
      </div>
      <Button type="submit" className="w-full">
        {isEdit ? "Save Changes" : "Log Payment"}
      </Button>
    </form>
  )
}

export function LogPaymentModal({
  open,
  onOpenChange,
  partyType: fixedPartyType,
  partyId: fixedPartyId,
  partyName: fixedPartyName,
  mode = "create",
  initial,
}: LogPaymentModalProps) {
  const isFreeParty = !fixedPartyType
  const partyName =
    fixedPartyName ?? (mode === "edit" ? "this payment" : "any party")

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "edit" ? "Edit Payment" : "Log Payment"}
      description={
        isFreeParty
          ? mode === "edit"
            ? "Update this payment's details."
            : "Record a payment for any client or direct seller."
          : `Record a payment for ${partyName}.`
      }
    >
      <PaymentForm
        key={initial?.id ?? "create"}
        fixedPartyType={fixedPartyType}
        fixedPartyId={fixedPartyId}
        fixedPartyName={fixedPartyName}
        mode={mode}
        initial={initial}
        todayISO={todayISO()}
        onDone={() => onOpenChange(false)}
      />
    </Modal>
  )
}
