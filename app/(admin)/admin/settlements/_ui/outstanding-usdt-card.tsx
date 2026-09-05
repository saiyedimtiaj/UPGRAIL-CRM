"use client"

import { useActiveSellers } from "@/features/use-sellers"
import { useBalances } from "@/features/use-analytics"
import { SectionCard } from "@/components/primitives/section-card"
import { Usdt } from "@/components/primitives/money"

type DueState = "owed" | "paid" | "advance"

const STATE_META: Record<DueState, { label: string; badgeClassName: string; valueClassName: string }> = {
  owed: {
    label: "Owed to Seller",
    badgeClassName: "bg-amber-400/15 text-amber-400",
    valueClassName: "text-amber-400",
  },
  paid: {
    label: "Fully Settled",
    badgeClassName: "bg-emerald-400/15 text-emerald-400",
    valueClassName: "text-emerald-400",
  },
  advance: {
    label: "Advance",
    badgeClassName: "bg-sky-400/15 text-sky-400",
    valueClassName: "text-sky-400",
  },
}

function dueState(balance: number): DueState {
  if (balance > 0) return "owed"
  if (balance < 0) return "advance"
  return "paid"
}

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
          const state = dueState(balance)
          const meta = STATE_META[state]
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
                {state === "paid" ? (
                  <div className="text-sm font-black text-emerald-400">—</div>
                ) : (
                  <Usdt
                    value={Math.abs(balance)}
                    className={`text-sm font-black ${meta.valueClassName}`}
                  />
                )}
                <span
                  className={`mt-1 inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${meta.badgeClassName}`}
                >
                  {meta.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}
