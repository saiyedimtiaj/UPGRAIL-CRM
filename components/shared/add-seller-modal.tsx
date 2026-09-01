"use client"

import * as React from "react"
import { toast } from "sonner"

import type { Seller, SellerRateType } from "@/lib/types"
import { useCreateSeller, useUpdateSeller } from "@/features/use-sellers"
import { getErrorMessage } from "@/lib/handleError"
import { Modal } from "@/components/primitives/modal"
import { SelectField } from "@/components/primitives/select-field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SubmitButton } from "@/components/primitives/submit-button"

function SellerForm({
  mode,
  initial,
  onDone,
}: {
  mode: "create" | "edit"
  initial?: Seller
  onDone: () => void
}) {
  const createSeller = useCreateSeller()
  const updateSeller = useUpdateSeller()
  const [name, setName] = React.useState(initial?.name ?? "")
  const [contact, setContact] = React.useState(initial?.contact ?? "")
  const [rateType, setRateType] = React.useState<SellerRateType>(
    initial?.rate_type ?? "CARD"
  )
  const [region, setRegion] = React.useState(initial?.region ?? "")
  const [flag, setFlag] = React.useState(initial?.flag ?? "")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    try {
      if (mode === "edit" && initial) {
        await updateSeller.mutateAsync({
          id: initial.id,
          name: name.trim(),
          contact: contact.trim(),
          rateType,
          region: region.trim() || undefined,
          flag: flag.trim() || undefined,
        })
        toast.success(`Seller "${name}" updated.`)
      } else {
        await createSeller.mutateAsync({
          name: name.trim(),
          contact: contact.trim(),
          rateType,
          region: region.trim(),
          flag: flag.trim() || undefined,
        })
        toast.success(`Seller "${name}" added.`)
      }
      onDone()
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save seller."))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="seller-name">Name</Label>
        <Input
          id="seller-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="seller-rate-type">Rate Type</Label>
        <SelectField
          id="seller-rate-type"
          value={rateType}
          onChange={(v) => setRateType(v as SellerRateType)}
          options={[
            { value: "DIRECT", label: "Direct (BDT/USD spot rate)" },
            { value: "CARD", label: "Card (% settled in USDT)" },
          ]}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="seller-contact">Contact</Label>
        <Input
          id="seller-contact"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="seller-region">Region</Label>
          <Input
            id="seller-region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="Singapore"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="seller-flag">Flag emoji</Label>
          <Input
            id="seller-flag"
            value={flag}
            onChange={(e) => setFlag(e.target.value)}
            placeholder="🇸🇬"
          />
        </div>
      </div>
      <SubmitButton
        type="submit"
        className="w-full"
        isSubmitting={createSeller.isPending || updateSeller.isPending}
        pendingLabel={mode === "edit" ? "Saving…" : "Adding seller…"}
      >
        {mode === "edit" ? "Save Changes" : "Add Seller"}
      </SubmitButton>
    </form>
  )
}

export function AddSellerModal({
  open,
  onOpenChange,
  mode = "create",
  initial,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode?: "create" | "edit"
  initial?: Seller
}) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "edit" ? "Edit Seller" : "New Seller"}
      description={
        mode === "edit"
          ? "Update this seller's sourcing details."
          : "Add a new USD sourcing desk."
      }
    >
      <SellerForm
        key={initial?.id ?? "create"}
        mode={mode}
        initial={initial}
        onDone={() => onOpenChange(false)}
      />
    </Modal>
  )
}
