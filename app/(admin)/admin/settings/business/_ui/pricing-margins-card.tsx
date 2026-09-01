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
import { SubmitButton } from "@/components/primitives/submit-button"

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
        <SubmitButton
          type="submit"
          size="sm"
          isSubmitting={updateSettings.isPending}
          pendingLabel="Saving…"
        >
          Save
        </SubmitButton>
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
      subtitle="ড্যাশবোর্ডে কোনো ট্রেড ফাইনাল হওয়ার আগে যে আনুমানিক spread margin দেখানো হয়"
    >
      <p className="mb-5 max-w-3xl rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-xs leading-5 text-emerald-950">
        এই fallback margin হলো প্রাথমিক অনুমান। কোনো ট্রেড ফাইনাল না হওয়া পর্যন্ত
        ড্যাশবোর্ডে সম্ভাব্য লাভের spread দেখাতে এটি ব্যবহার করা হয়। ট্রেড ফাইনাল
        হলে প্রকৃত buy ও sell rate থেকে হিসাব করা realized spread এই মানকে প্রতিস্থাপন
        করে।
      </p>
      {isPending || !settings ? (
        <Skeleton className="h-16 rounded-xl" />
      ) : (
        <PricingMarginsForm settings={settings} isOwner={isOwner} />
      )}
    </SectionCard>
  )
}
