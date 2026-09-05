"use client"

import * as React from "react"
import { X } from "lucide-react"

import { useMetrics } from "@/features/use-analytics"
import { useTransactions } from "@/features/use-transactions"
import { usePayments } from "@/features/use-payments"
import { useTransfers } from "@/features/use-transfers"
import { todayISO } from "@/lib/date"
import { StatCard } from "@/components/primitives/stat-card"
import { DatePicker } from "@/components/ui/date-picker"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { bdt } from "@/lib/format"

const TOTALS_LIMIT = 500

export function ProfitMetrics() {
  const { data: metrics } = useMetrics()

  // Empty means lifetime. All four cards below recompute from the raw
  // trades/payments/transfers in this window rather than the cached lifetime
  // `metrics` aggregate, which has no date parameter of its own.
  const [range, setRange] = React.useState({ from: "", to: "" })
  const hasRangeFilter = range.from !== "" || range.to !== ""

  const { data: totalsTx } = useTransactions({
    limit: TOTALS_LIMIT,
    dateFrom: range.from || undefined,
    dateTo: range.to || undefined,
  })
  const trades = (totalsTx?.data ?? []).filter((t) => !t.voided)
  const totalsTruncated = (totalsTx?.meta.totalCount ?? 0) > TOTALS_LIMIT

  const totalEarnedProfitInRange = trades
    .filter((t) => t.profit_status === "FINALIZED")
    .reduce((sum, t) => sum + (t.profit ?? 0), 0)

  const pendingTrades = trades.filter(
    (t) =>
      t.profit_status === "PENDING_UNSETTLED" ||
      t.profit_status === "PENDING_PARTIAL" ||
      t.profit_status === "AWAITING_DAILY_RATE"
  )

  const totalEarnedProfit = hasRangeFilter
    ? totalEarnedProfitInRange
    : (metrics?.totalEarnedProfit ?? 0)
  const pendingCount = hasRangeFilter
    ? pendingTrades.length
    : (metrics?.profitPendingCount ?? 0)

  // Mirrors the backend's computeProfitTakenOut: client payments straight
  // into the profit bank, plus transfers moved in, minus transfers moved
  // out — only fetched/enabled once a range is actually picked, since the
  // lifetime figure already comes for free on `metrics`.
  const { data: profitBankPaymentsPage } = usePayments({
    direction: "IN",
    limit: TOTALS_LIMIT,
    dateFrom: range.from || undefined,
    dateTo: range.to || undefined,
  })
  const { data: transfersInPage } = useTransfers({
    toDestination: "PROFIT_BANK",
    limit: TOTALS_LIMIT,
    dateFrom: range.from || undefined,
    dateTo: range.to || undefined,
  })
  const { data: transfersOutPage } = useTransfers({
    fromDestination: "PROFIT_BANK",
    limit: TOTALS_LIMIT,
    dateFrom: range.from || undefined,
    dateTo: range.to || undefined,
  })

  const clientToProfitBank = (profitBankPaymentsPage?.data ?? [])
    .filter((p) => !p.voided && p.destination === "PROFIT_BANK")
    .reduce((sum, p) => sum + p.amount, 0)
  const transfersIn = (transfersInPage?.data ?? [])
    .filter((t) => !t.voided)
    .reduce((sum, t) => sum + t.amount_bdt, 0)
  const transfersOut = (transfersOutPage?.data ?? [])
    .filter((t) => !t.voided)
    .reduce((sum, t) => sum + t.amount_bdt, 0)

  const profitTakenOutInRange = clientToProfitBank + transfersIn - transfersOut
  const profitTakenOut = hasRangeFilter
    ? profitTakenOutInRange
    : (metrics?.profitTakenOut ?? 0)
  // "Remaining" only makes sense against the same window's earned profit —
  // otherwise a range with no new profit but an old withdrawal would show as
  // negative for reasons the window itself doesn't explain.
  const profitRemaining = hasRangeFilter
    ? totalEarnedProfit - profitTakenOut
    : (metrics?.profitRemaining ?? 0)

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <div className="flex flex-wrap items-end gap-2.5">
          <div className="space-y-1.5">
            <Label htmlFor="profit-stats-date-from" className="text-[11px] text-slate-500">
              From
            </Label>
            <DatePicker
              id="profit-stats-date-from"
              value={range.from}
              onChange={(next) => setRange((r) => ({ ...r, from: next }))}
              max={range.to || todayISO()}
              clearable
              className="h-9 w-40"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profit-stats-date-to" className="text-[11px] text-slate-500">
              To
            </Label>
            <DatePicker
              id="profit-stats-date-to"
              value={range.to}
              onChange={(next) => setRange((r) => ({ ...r, to: next }))}
              min={range.from || undefined}
              max={todayISO()}
              clearable
              className="h-9 w-40"
            />
          </div>
          {hasRangeFilter && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 gap-1 text-slate-500"
              onClick={() => setRange({ from: "", to: "" })}
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <StatCard
          tone="dark"
          label={hasRangeFilter ? "Earned Profit in Range" : "Total Earned Profit"}
          value={totalEarnedProfit}
          format={(n) => bdt(n)}
          delta={{
            direction: "up",
            label: "Finalized trades only",
          }}
        />
        <StatCard
          tone="light"
          accent="sky"
          label={hasRangeFilter ? "Taken Out in Range" : "Profit Taken Out"}
          value={profitTakenOut}
          format={(n) => bdt(n)}
        />
        <StatCard
          tone="light"
          accent="emerald"
          label={hasRangeFilter ? "Remaining in Range" : "Profit Remaining"}
          value={profitRemaining}
          format={(n) => bdt(n)}
        />
        <StatCard
          tone="light"
          accent="amber"
          label="Profit Finalization Status"
          value={pendingCount}
          format={(n) => `${Math.round(n)} pending`}
          footer={
            <span className="text-[11px] font-semibold text-slate-500">
              {pendingCount === 0
                ? "Every trade is finalized"
                : `Trade(s) awaiting a daily rate or settlement${
                    hasRangeFilter ? " in range" : ""
                  }${totalsTruncated ? " (500+ cap)" : ""}`}
            </span>
          }
        />
      </div>
    </div>
  )
}
