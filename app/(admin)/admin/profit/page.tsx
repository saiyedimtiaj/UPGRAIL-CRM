import { ProfitMetrics } from "@/app/(admin)/admin/profit/_ui/profit-metrics"
import { LiquidityWarning } from "@/app/(admin)/admin/profit/_ui/liquidity-warning"
import { WithdrawalHistory } from "@/app/(admin)/admin/profit/_ui/withdrawal-history"

// Access is enforced by RouteGuard via ROUTE_PERMISSIONS ("profit.view"), so
// this page no longer carries its own role check.
export default function ProfitPage() {
  return (
    <div className="w-full space-y-5 p-4 sm:space-y-6 sm:p-6">
      <ProfitMetrics />
      <LiquidityWarning />
      <WithdrawalHistory />
    </div>
  )
}
