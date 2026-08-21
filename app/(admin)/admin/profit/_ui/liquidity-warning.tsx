import { AlertTriangle } from "lucide-react"

export function LiquidityWarning() {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        <strong>Receivables vs Payable Liquidity Safeguard:</strong> the
        profit pool reflects <em>realized</em> spread only. Outstanding client
        receivables and seller payables are tracked separately — do not withdraw
        against unsettled balances.
      </p>
    </div>
  )
}
