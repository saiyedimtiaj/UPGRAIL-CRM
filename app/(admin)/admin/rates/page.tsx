"use client"

import * as React from "react"
import { toast } from "sonner"
import { AlertTriangle, History } from "lucide-react"

import { isoDaysAgo, todayISO } from "@/lib/date"
import { useRates, useUpsertRate } from "@/features/use-rates"
import { useTransactions } from "@/features/use-transactions"
import { useMe } from "@/features/use-auth"
import { getErrorMessage } from "@/lib/handleError"
import { SectionCard } from "@/components/primitives/section-card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { NazmulRatesCard } from "@/app/(admin)/admin/rates/_ui/nazmul-rates-card"
import { ClientRatesGrid } from "@/app/(admin)/admin/rates/_ui/client-rates-grid"


export default function RatesPage() {
  const { data: me } = useMe()
  const [date, setDate] = React.useState(todayISO())

  const { data: txData } = useTransactions({ date, limit: 500 })
  const { data: allRates = [] } = useRates()
  const upsertRate = useUpsertRate()

  const pendingForDate = (txData?.data ?? []).filter(
    (t) =>
      !t.voided &&
      (t.client_charge_status === "AWAITING_CLIENT_RATE" ||
        t.profit_status === "AWAITING_DAILY_RATE")
  )

  async function prefillYesterday() {
    const yesterday = isoDaysAgo(1, date)
    const yesterdaysRates = allRates.filter((r) => r.date === yesterday)
    if (yesterdaysRates.length === 0) {
      toast.error("No rates found for the previous day.")
      return
    }
    try {
      for (const r of yesterdaysRates) {
        await upsertRate.mutateAsync({
          date,
          partyType: r.party_type,
          partyId: r.party_id,
          kind: r.kind,
          value: r.value,
          reason: `Pre-filled from ${yesterday} by ${me?.name ?? "system"}`,
        })
      }
      toast.success(
        `Pre-filled ${yesterdaysRates.length} rate(s) from yesterday.`
      )
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to pre-fill rates."))
    }
  }

  return (
    <div className="w-full space-y-5 p-4 sm:space-y-6 sm:p-6">
      <SectionCard>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="rate-date">Rate Date</Label>
            <DatePicker
              id="rate-date"
              value={date}
              onChange={(value) => setDate(value)}
              className="w-48"
            />
          </div>
          <Button
            variant="outline"
            onClick={prefillYesterday}
            className="gap-1.5"
          >
            <History className="h-3.5 w-3.5" />
            Pre-fill Yesterday&rsquo;s Rates
          </Button>
        </div>
      </SectionCard>

      {pendingForDate.length > 0 && (
        <div className="flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {pendingForDate.length} trade(s) on {date} are awaiting a rate —
          completing the missing rates below will auto-price them.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <NazmulRatesCard key={`nazmul-${date}`} date={date} />
      </div>

      <ClientRatesGrid key={`client-rates-${date}`} date={date} />
    </div>
  )
}
