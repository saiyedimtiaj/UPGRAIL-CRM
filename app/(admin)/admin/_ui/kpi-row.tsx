"use client"

import Link from "next/link"
import { motion } from "motion/react"
import {
  ArrowUpRight,
  Banknote,
  Coins,
  DollarSign,
  Landmark,
} from "lucide-react"

import { bdt, usd } from "@/lib/format"
import { staggerChild, staggerParent } from "@/lib/animations"
import { useMetrics, useTimeSeries } from "@/features/use-analytics"
import { StatCard } from "@/components/primitives/stat-card"
import { Alert } from "@/components/shared/alert"
import { Skeleton } from "@/components/ui/skeleton"


export function KpiRow() {
  const { data: metrics, isPending, isError } = useMetrics()
  const { data: weekly } = useTimeSeries("weekly")

  if (isError) {
    return (
      <Alert
        variant="error"
        message="Couldn't load dashboard figures. Refresh the page to try again."
      />
    )
  }

  if (isPending || !metrics) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
    )
  }

  const volumeDelta = (() => {
    if (!weekly || weekly.points.length < 2) return undefined
    const points = weekly.points
    const today = points[points.length - 1]
    const priorDays = points.slice(0, -1)
    const priorAvg =
      priorDays.reduce((sum, p) => sum + p.volumeUSD, 0) / priorDays.length
    if (priorAvg <= 0) return undefined
    const changePercent = ((today.volumeUSD - priorAvg) / priorAvg) * 100
    return {
      direction: changePercent >= 0 ? ("up" as const) : ("down" as const),
      label: `${Math.abs(changePercent).toFixed(1)}% vs 7-day avg`,
    }
  })()

  return (
    <motion.div
      variants={staggerParent}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4"
    >
      <motion.div variants={staggerChild} className="h-full">
        <StatCard
          tone="dark"
          icon={DollarSign}
          label="This Week's USD Volume"
          value={weekly?.points.at(-1)?.volumeUSD ?? 0}
          format={(n) => `${usd(n)} USD`}
          delta={volumeDelta}
          footer={
            metrics.profitPendingCount > 0 ? (
              <Link
                href="/admin/trades"
                className="inline-flex items-center gap-1 text-[11px] font-bold whitespace-nowrap text-amber-400 hover:text-amber-300"
                title={`${metrics.profitPendingCount} trade${metrics.profitPendingCount === 1 ? "" : "s"} awaiting settlement, ${bdt(metrics.profitPendingClientSalesValue)} client sales value`}
              >
                {metrics.profitPendingCount} pending
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            ) : undefined
          }
        />
      </motion.div>

      <motion.div variants={staggerChild} className="h-full">
        <StatCard
          tone="light"
          icon={Landmark}
          label="Total Client Due"
          value={metrics.totalClientDue}
          format={(n) => bdt(n)}
          footer={
            <Link
              href="/admin/client-ledger"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
            >
              View Ledgers
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          }
        />
      </motion.div>

      <motion.div variants={staggerChild} className="h-full">
        <StatCard
          tone="light"
          icon={Banknote}
          label="Nazmul Due"
          value={metrics.nazmulDue}
          format={(n) => bdt(n)}
          footer={
            <Link
              href="/admin/settlements"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
            >
              Settlements
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          }
        />
      </motion.div>

      <motion.div variants={staggerChild} className="h-full">
        <StatCard
          tone="mint"
          icon={Coins}
          label="Total Earned Profit"
          value={metrics.totalEarnedProfit}
          format={(n) => bdt(n)}
          delta={{
            direction: "up",
            label: `৳${metrics.profitRemaining.toLocaleString()} remaining`,
          }}
          footer={
            <div className="w-full border-t border-emerald-900/10 pt-2.5 text-[11px] font-semibold text-emerald-800/70">
              {metrics.totalSellerUsdtDue > 0
                ? `${metrics.totalSellerUsdtDue.toLocaleString()} USDT owed to sellers`
                : "All sellers fully settled"}
            </div>
          }
        />
      </motion.div>
    </motion.div>
  )
}
