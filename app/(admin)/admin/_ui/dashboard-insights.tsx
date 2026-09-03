"use client"

import { useTransactionStats } from "@/features/use-transactions"
import { SectionCard } from "@/components/primitives/section-card"
import { ProfitOverview } from "./profit-overview"
import { TransactionStatusDonut } from "./transaction-status-donut"

export function DashboardInsights() {
  const { data: stats, isPending } = useTransactionStats()

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <SectionCard
          title="Profit Overview"
          subtitle="Earned, withdrawn, and what is still waiting"
        >
          <ProfitOverview />
        </SectionCard>
      </div>
      <div className="lg:col-span-5">
        <SectionCard
          title="Transaction Status"
          subtitle="Where every trade currently sits"
        >
          <TransactionStatusDonut stats={stats} isLoading={isPending} />
        </SectionCard>
      </div>
    </div>
  )
}
