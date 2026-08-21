"use client"

import { useMe } from "@/features/use-auth"
import { LockScreen } from "@/components/primitives/lock-screen"
import { ProfitMetrics } from "@/app/(admin)/admin/profit/_ui/profit-metrics"
import { LiquidityWarning } from "@/app/(admin)/admin/profit/_ui/liquidity-warning"
import { WithdrawalForm } from "@/app/(admin)/admin/profit/_ui/withdrawal-form"
import { WithdrawalHistory } from "@/app/(admin)/admin/profit/_ui/withdrawal-history"

// Gated for staff without profit visibility; owners/partners always have
// access. A staff member's canViewProfit flag is toggled from Settings.
export default function ProfitPage() {
  const { data: me } = useMe()

  if (me?.role.name === "STAFF" && !me.canViewProfit) {
    return (
      <div className="w-full p-4 sm:p-6">
        <LockScreen
          title="Profit Pool Access Restricted"
          description="Your account does not have profit visibility enabled. Ask an owner or partner to grant access from Settings."
        />
      </div>
    )
  }

  return (
    <div className="w-full space-y-5 p-4 sm:space-y-6 sm:p-6">
      <ProfitMetrics />
      <LiquidityWarning />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <WithdrawalForm />
        </div>
        <div className="lg:col-span-7">
          <WithdrawalHistory />
        </div>
      </div>
    </div>
  )
}
