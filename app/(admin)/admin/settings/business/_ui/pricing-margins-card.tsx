"use client"

import * as React from "react"
import { toast } from "sonner"
import { Percent } from "lucide-react"

import type { BusinessSettings } from "@/lib/types"
import { useMe } from "@/features/use-auth"
import { useSettings, useUpdateSettings } from "@/features/use-settings"
import { getErrorMessage } from "@/lib/handleError"
import { SectionCard } from "@/components/primitives/section-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

function PricingMarginsForm({ settings, isOwner }: { settings: BusinessSettings; isOwner: boolean }) {
  const updateSettings = useUpdateSettings()
  const [value, setValue] = React.useState(String(settings.spreadMarginFallbackPercent))

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const num = Number(value)
    if (Number.isNaN(num) || num < 0 || num > 100) {
      toast.error("Enter a percentage between 0 and 100.")
      return
    }
    try {
      await updateSettings.mutateAsync({ spreadMarginFallbackPercent: num })
      toast.success("Spread margin fallback updated.")
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update spread margin fallback"))
    }
  }

  return (
    <form onSubmit={handleSave} className="flex flex-wrap items-end gap-3">
      <div className="space-y-1.5">
        <Label htmlFor="spread-margin-fallback">Spread Margin Fallback</Label>
        <div className="relative w-40">
          <Input
            id="spread-margin-fallback"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={!isOwner}
            className="pr-8"
          />
          <Percent className="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        </div>
      </div>
      {isOwner && (
        <Button type="submit" disabled={updateSettings.isPending} size="sm">
          Save
        </Button>
      )}
    </form>
  )
}


export function PricingMarginsCard() {
  const { data: me } = useMe()
  const { data: settings, isPending } = useSettings()
  const isOwner = me?.role.name === "OWNER"

  return (
    <SectionCard
      title="Pricing & Margins"
      subtitle="The spread margin shown on the dashboard before any trade has finalized"
    >
      {isPending || !settings ? (
        <Skeleton className="h-16 rounded-xl" />
      ) : (
        <PricingMarginsForm settings={settings} isOwner={isOwner} />
      )}
    </SectionCard>
  )
}
