"use client"

import * as React from "react"
import { toast } from "sonner"
import { Plus, X } from "lucide-react"

import type { BusinessSettings } from "@/lib/types"
import { useSettings, useUpdateSettings } from "@/features/use-settings"
import { getErrorMessage } from "@/lib/handleError"
import { SectionCard } from "@/components/primitives/section-card"
import { Skeleton } from "@/components/ui/skeleton"
import { SelectField } from "@/components/primitives/select-field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { SubmitButton } from "@/components/primitives/submit-button"
import { usePermissions } from "@/hooks/use-permission"

function PaymentMethodsForm({ settings, isOwner }: { settings: BusinessSettings; isOwner: boolean }) {
  const updateSettings = useUpdateSettings()
  const [methods, setMethods] = React.useState<string[]>(settings.paymentMethods)
  const [defaultMethod, setDefaultMethod] = React.useState(settings.defaultPaymentMethod)
  const [newMethod, setNewMethod] = React.useState("")

  function addMethod() {
    const trimmed = newMethod.trim()
    if (!trimmed || methods.includes(trimmed)) return
    setMethods((m) => [...m, trimmed])
    setNewMethod("")
  }

  function removeMethod(method: string) {
    if (methods.length <= 1) {
      toast.error("At least one payment method is required.")
      return
    }
    if (method === defaultMethod) {
      toast.error("Can't remove the current default — pick a different default first.")
      return
    }
    setMethods((m) => m.filter((x) => x !== method))
  }

  async function handleSave() {
    try {
      await updateSettings.mutateAsync({ paymentMethods: methods, defaultPaymentMethod: defaultMethod })
      toast.success("Payment methods updated.")
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update payment methods"))
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {methods.map((method) => (
          <div
            key={method}
            className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
          >
            <span className="text-sm font-medium text-slate-800">
              {method}
              {method === defaultMethod && (
                <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
                  Default
                </span>
              )}
            </span>
            {isOwner && (
              <button
                type="button"
                onClick={() => removeMethod(method)}
                className="rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                title="Remove"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {isOwner && (
        <>
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="new-payment-method">Add a method</Label>
              <Input
                id="new-payment-method"
                value={newMethod}
                onChange={(e) => setNewMethod(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addMethod()
                  }
                }}
                placeholder="e.g. Rocket"
              />
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addMethod} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="default-payment-method">Default method</Label>
            <SelectField
              id="default-payment-method"
              value={defaultMethod}
              onChange={setDefaultMethod}
              options={methods.map((m) => ({ value: m, label: m }))}
            />
          </div>

          <SubmitButton
            type="button"
            onClick={handleSave}
            size="sm"
            isSubmitting={updateSettings.isPending}
            pendingLabel="Saving…"
          >
            Save
          </SubmitButton>
        </>
      )}
    </div>
  )
}


export function PaymentMethodsCard() {
  const { data: settings, isPending } = useSettings()
  const { can } = usePermissions()
  const isOwner = can("settings.business")

  return (
    <SectionCard
      title="Payment Methods"
      subtitle="Options offered when logging a payment, and which one is pre-selected"
    >
      {isPending || !settings ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded-lg" />
          ))}
        </div>
      ) : (
        <PaymentMethodsForm settings={settings} isOwner={isOwner} />
      )}
    </SectionCard>
  )
}
