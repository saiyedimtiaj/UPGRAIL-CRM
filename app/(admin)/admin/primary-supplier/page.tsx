"use client"

import Link from "next/link"
import { ArrowRight, Landmark } from "lucide-react"

import { bdt } from "@/lib/format"
import { useBalances } from "@/features/use-analytics"
import { useActiveSellers } from "@/features/use-sellers"
import { findConduitSeller } from "@/lib/calc/rates"
import { PageHeader } from "@/components/primitives/page-header"
import { SectionCard } from "@/components/primitives/section-card"
import { StatCard } from "@/components/primitives/stat-card"
import { Skeleton } from "@/components/ui/skeleton"
import EmptyState from "@/components/shared/empty-state"
import { TransactionsTable } from "@/components/shared/transactions-table"

export default function PrimarySupplierPage() {
  const { data: sellers = [], isPending } = useActiveSellers()
  const { data: balances } = useBalances()

  const conduit = findConduitSeller(sellers)

  if (isPending) {
    return (
      <div className="w-full space-y-5 p-4 sm:p-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (!conduit) {
    return (
      <div className="w-full p-4 sm:p-6">
        <EmptyState
          title="No settlement conduit configured"
          description="Mark one seller as the settlement conduit to see their ledger here."
          action={
            <Link
              href="/admin/sellers"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:underline"
            >
              Go to Sellers <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
      </div>
    )
  }

  const fronted = balances?.sellerFrontingBalances?.[conduit.id] ?? 0

  return (
    <div className="w-full space-y-5 p-4 sm:space-y-6 sm:p-6">
      <PageHeader
        icon={Landmark}
        title={conduit.name}
        subtitle="Primary supplier — settles external sellers on the business's behalf"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          tone="dark"
          icon={Landmark}
          label="Amount Payable (BDT)"
          value={balances?.nazmulDue ?? 0}
          format={(n) => bdt(n)}
          footer={
            <span className="text-[11px] font-semibold text-zinc-400">
              What the business owes the conduit
            </span>
          }
        />
        <StatCard
          icon={ArrowRight}
          label="Fronted for Others (BDT)"
          value={fronted}
          format={(n) => bdt(n)}
          footer={
            <span className="text-[11px] font-semibold text-slate-500">
              Net of anything fronted for them
            </span>
          }
        />
      </div>

      <SectionCard
        title="Transactions"
        subtitle="Trades sourced directly through the conduit"
      >
        <TransactionsTable
          filters={{ sellerId: conduit.id }}
          hide={["seller"]}
          emptyLabel="transactions"
        />
      </SectionCard>
    </div>
  )
}
