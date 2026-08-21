"use client"

import * as React from "react"
import { toast } from "sonner"

import type { Client } from "@/lib/types"
import { useCreateClient, useUpdateClient } from "@/features/use-clients"
import { getErrorMessage } from "@/lib/handleError"
import { Modal } from "@/components/primitives/modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

function ClientForm({
  mode,
  initial,
  onDone,
}: {
  mode: "create" | "edit"
  initial?: Client
  onDone: () => void
}) {
  const createClient = useCreateClient()
  const updateClient = useUpdateClient()
  const [name, setName] = React.useState(initial?.name ?? "")
  const [company, setCompany] = React.useState(initial?.company ?? "")
  const [contact, setContact] = React.useState(initial?.contact ?? "")
  const [region, setRegion] = React.useState(initial?.region ?? "")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    try {
      if (mode === "edit" && initial) {
        await updateClient.mutateAsync({
          id: initial.id,
          name: name.trim(),
          company: company.trim(),
          contact: contact.trim(),
          region: region.trim() || undefined,
        })
        toast.success(`Client "${name}" updated.`)
      } else {
        await createClient.mutateAsync({
          name: name.trim(),
          company: company.trim(),
          contact: contact.trim(),
          region: region.trim(),
        })
        toast.success(`Client "${name}" added.`)
      }
      onDone()
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save client."))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="client-name">Name</Label>
        <Input
          id="client-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="client-company">Company</Label>
        <Input
          id="client-company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="client-contact">Contact</Label>
        <Input
          id="client-contact"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="client-region">Region</Label>
        <Input
          id="client-region"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder="Dhaka, BD"
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={createClient.isPending || updateClient.isPending}
      >
        {mode === "edit" ? "Save Changes" : "Add Client"}
      </Button>
    </form>
  )
}

export function AddClientModal({
  open,
  onOpenChange,
  mode = "create",
  initial,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode?: "create" | "edit"
  initial?: Client
}) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "edit" ? "Edit Client" : "New Client"}
      description={
        mode === "edit"
          ? "Update this client's details."
          : "Add a new ad agency client."
      }
    >
      <ClientForm
        key={initial?.id ?? "create"}
        mode={mode}
        initial={initial}
        onDone={() => onOpenChange(false)}
      />
    </Modal>
  )
}
