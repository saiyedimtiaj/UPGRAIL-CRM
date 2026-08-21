"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { ArrowUpRight } from "lucide-react"

import { staggerChild, staggerParent } from "@/lib/animations"
import { useSellerPerformance } from "@/features/use-analytics"
import { SectionCard } from "@/components/primitives/section-card"
import { SparkLine } from "@/components/primitives/spark-line"
import { SelectField } from "@/components/primitives/select-field"
import { Alert } from "@/components/shared/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { BDT_SYMBOL } from "@/lib/constants"

export function RegionalSourcingTable() {
  const { data: rows, isPending, isError } = useSellerPerformance()
  const [regionFilter, setRegionFilter] = React.useState("All regions")

  const filteredRows = (rows ?? []).filter((row) => {
    if (regionFilter === "Direct") return row.rateType === "DIRECT"
    if (regionFilter === "Card") return row.rateType === "CARD"
    return true
  })

  return (
    <SectionCard
      title="Active Sourcing & Sellers by Region"
      subtitle="Live performance, rate mechanisms, and settlement throughput"
      action={
        <SelectField
          variant="pill-dark"
          value={regionFilter}
          onChange={setRegionFilter}
          options={[
            { value: "All regions", label: "All regions" },
            { value: "Direct", label: "Direct USD" },
            { value: "Card", label: "Card % Sellers" },
          ]}
        />
      }
    >
      {isError ? (
        <Alert
          variant="error"
          message="Couldn't load seller performance. Refresh the page to try again."
        />
      ) : isPending ? (
        <div className="space-y-3 py-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : filteredRows.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-400">
          No sourcing activity yet for this filter.
        </p>
      ) : (
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-140 text-left text-xs sm:min-w-0">
            <thead>
              <tr className="border-b border-slate-100 font-medium text-slate-400">
                <th className="pb-3 font-semibold whitespace-nowrap">
                  Region / Entity
                </th>
                <th className="pb-3 font-semibold whitespace-nowrap">Deals</th>
                <th className="pb-3 font-semibold whitespace-nowrap">Quota</th>
                <th className="pb-3 font-semibold whitespace-nowrap">Trend</th>
                <th className="pb-3 font-semibold whitespace-nowrap">
                  Rate Mechanism
                </th>
                <th className="pb-3 font-semibold whitespace-nowrap">
                  Total Value
                </th>
                <th className="pb-3 text-right font-semibold"></th>
              </tr>
            </thead>
            <motion.tbody
              variants={staggerParent}
              initial="hidden"
              animate="show"
              className="divide-y divide-slate-100"
            >
              {filteredRows.map((row) => (
                <motion.tr
                  key={row.sellerId}
                  variants={staggerChild}
                  className="group transition-colors hover:bg-slate-50/80"
                >
                  <td className="py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{row.flag}</span>
                      <div>
                        <div className="leading-tight font-bold text-slate-900">
                          {row.name}
                        </div>
                        <div className="text-[10px] font-medium text-slate-400">
                          {row.region}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 font-semibold text-slate-700">
                    {row.dealCount} deal{row.dealCount === 1 ? "" : "s"}
                  </td>
                  <td className="py-3.5 font-semibold text-slate-700">
                    {row.quotaPercent.toFixed(0)}%
                  </td>
                  <td className="py-3.5">
                    <SparkLine trend={row.trendDirection} />
                  </td>
                  <td className="py-3.5">
                    <span className="rounded-md border border-amber-200/60 bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-800">
                      {row.rateType === "DIRECT"
                        ? "Direct Spot BDT"
                        : "Card % / USDT"}
                    </span>
                  </td>
                  <td className="py-3.5 font-mono font-bold text-slate-900">
                    {BDT_SYMBOL}
                    {Math.round(row.totalValueBdt).toLocaleString()}
                  </td>
                  <td className="py-3.5 text-right text-slate-400 group-hover:text-slate-700">
                    <Link
                      href="/admin/sellers"
                      className="inline-flex rounded-md p-1 transition-colors hover:bg-slate-200/60"
                      title="Manage this seller"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
      )}
    </SectionCard>
  )
}
