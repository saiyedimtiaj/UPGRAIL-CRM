"use client"

import * as React from "react"
import { toast } from "sonner"

import type { BusinessSettings } from "@/lib/types"
import { useMe } from "@/features/use-auth"
import { useSettings, useUpdateSettings } from "@/features/use-settings"
import { getErrorMessage } from "@/lib/handleError"
import { SectionCard } from "@/components/primitives/section-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"


function DashboardDisplayForm({ settings, isOwner }: { settings: BusinessSettings; isOwner: boolean }) {
  const updateSettings = useUpdateSettings()
  const [reportWindow, setReportWindow] = React.useState(String(settings.defaultReportWindowDays))
  const [topSellers, setTopSellers] = React.useState(String(settings.dashboardTopSellersCount))
  const [trendWindow, setTrendWindow] = React.useState(String(settings.trendWindowDays))

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const values = {
      defaultReportWindowDays: Number(reportWindow),
      dashboardTopSellersCount: Number(topSellers),
      trendWindowDays: Number(trendWindow),
    }
    if (Object.values(values).some((n) => Number.isNaN(n) || n < 1)) {
      toast.error("Enter a positive whole number for each field.")
      return
    }
    try {
      await updateSettings.mutateAsync(values)
      toast.success("Dashboard display settings updated.")
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update dashboard display settings"))
    }
  }

  return (
    <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="space-y-1.5">
        <Label htmlFor="default-report-window">Default Report Window (days)</Label>
        <Input
          id="default-report-window"
          type="number"
          min="1"
          max="365"
          value={reportWindow}
          onChange={(e) => setReportWindow(e.target.value)}
          disabled={!isOwner}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="dashboard-top-sellers">Top Sellers Shown</Label>
        <Input
          id="dashboard-top-sellers"
          type="number"
          min="1"
          max="50"
          value={topSellers}
          onChange={(e) => setTopSellers(e.target.value)}
          disabled={!isOwner}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="trend-window">Trend Comparison Window (days)</Label>
        <Input
          id="trend-window"
          type="number"
          min="1"
          max="90"
          value={trendWindow}
          onChange={(e) => setTrendWindow(e.target.value)}
          disabled={!isOwner}
        />
      </div>
      {isOwner && (
        <div className="sm:col-span-3">
          <Button type="submit" disabled={updateSettings.isPending} size="sm">
            Save
          </Button>
        </div>
      )}
    </form>
  )
}


export function DashboardDisplayCard() {
  const { data: me } = useMe()
  const { data: settings, isPending } = useSettings()
  const isOwner = me?.role.name === "OWNER"

  return (
    <SectionCard
      title="Dashboard Display"
      subtitle="Default windows and row counts used across Reports and the dashboard"
    >
      {isPending || !settings ? (
        <Skeleton className="h-16 rounded-xl" />
      ) : (
        <DashboardDisplayForm settings={settings} isOwner={isOwner} />
      )}
    </SectionCard>
  )
}
