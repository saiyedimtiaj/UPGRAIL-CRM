import { Bdt, Usdt } from "@/components/primitives/money"
import { ProfitStatusBadge } from "@/components/primitives/profit-status-badge"

interface TradePreviewStripProps {
  usdAmount: number
  cardRate: number
  isConduit: boolean
  clientRate?: number
  conduitUsdtRate?: number
}

export function TradePreviewStrip({
  usdAmount,
  cardRate,
  isConduit,
  clientRate,
  conduitUsdtRate,
}: TradePreviewStripProps) {
  const sellerUsdtEntitlement = usdAmount * (cardRate / 100)
  const sellBdt = clientRate !== undefined ? usdAmount * clientRate : undefined

  const canFinalizeSameDay = isConduit && conduitUsdtRate !== undefined
  const actualBuyBdt = canFinalizeSameDay
    ? sellerUsdtEntitlement * conduitUsdtRate!
    : undefined
  const profit =
    actualBuyBdt !== undefined && sellBdt !== undefined
      ? sellBdt - actualBuyBdt
      : undefined

  const status =
    !isConduit
      ? "PENDING_UNSETTLED"
      : conduitUsdtRate === undefined
        ? "AWAITING_DAILY_RATE"
        : profit !== undefined
          ? "FINALIZED"
          : "AWAITING_DAILY_RATE"

  return (
    <div className="grid grid-cols-2 gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 sm:grid-cols-4">
      <div>
        <div className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
          Sell (BDT)
        </div>
        <Bdt value={sellBdt} className="text-sm font-bold text-slate-900" />
      </div>
      <div>
        <div className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
          Seller USDT Entitlement
        </div>
        <Usdt
          value={sellerUsdtEntitlement}
          className="text-sm font-bold text-slate-900"
        />
      </div>
      <div>
        <div className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
          Buy (BDT)
        </div>
        {actualBuyBdt !== undefined ? (
          <Bdt value={actualBuyBdt} className="text-sm font-bold text-slate-900" />
        ) : (
          <span className="text-sm font-bold text-slate-400">
            {isConduit ? "Awaiting rate" : "Pending settlement"}
          </span>
        )}
      </div>
      <div className="flex flex-col justify-between">
        <div className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
          Profit
        </div>
        <div className="flex items-center justify-between gap-2">
          {profit !== undefined ? (
            <Bdt value={profit} className="text-sm font-bold text-emerald-700" />
          ) : (
            <span className="text-sm font-bold text-slate-400">—</span>
          )}
          <ProfitStatusBadge status={status} />
        </div>
      </div>
    </div>
  )
}
