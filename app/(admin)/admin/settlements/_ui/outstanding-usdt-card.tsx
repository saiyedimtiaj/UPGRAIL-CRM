"use client"

import { useActiveSellers } from "@/features/use-sellers"
import { useBalances } from "@/features/use-analytics"
import { SectionCard } from "@/components/primitives/section-card"
import { Usdt } from "@/components/primitives/money"


export function OutstandingUsdtCard() {
  const { data: sellers = [] } = useActiveSellers()
  const { data: balances } = useBalances()
  const sellerUsdtDues = balances?.sellerUsdtDues ?? {}
  const externalSellers = sellers.filter((s) => !s.isSettlementConduit)

  return (
    <SectionCard variant="dark" title="Outstanding USDT by External Seller">
      <div className="space-y-3">
        {externalSellers.map((seller) => {
          const balance = sellerUsdtDues[seller.id] ?? 0
          const isOwed = balance > 0
          return (
            <div
              key={seller.id}
              className="flex items-center justify-between rounded-xl bg-brand-panel-2 px-4 py-3"
            >
              <div>
                <div className="text-sm font-bold text-white">
                  {seller.flag} {seller.name}
                </div>
                <div className="text-[10px] text-zinc-400">{seller.region}</div>
              </div>
              <div className="text-right">
                <Usdt
                  value={Math.abs(balance)}
                  className={`text-sm font-black ${isOwed ? "text-amber-400" : "text-emerald-400"}`}
                />
                <div className="text-[10px] text-zinc-500">
                  {isOwed ? "Owed to Seller" : "Fully Settled"}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}
