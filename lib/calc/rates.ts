import type { DailyRate, PartyType, RateKind, Seller } from "@/lib/types"

/** Rates are keyed by (date, party_type, party_id, kind); centralizes that lookup. */
export function findRate(
  rates: DailyRate[],
  args: {
    date: string
    party_type: PartyType
    party_id: number
    kind: RateKind
  }
): DailyRate | undefined {
  return rates.find(
    (r) =>
      r.date === args.date &&
      r.party_type === args.party_type &&
      r.party_id === args.party_id &&
      r.kind === args.kind
  )
}

export function findRateValue(
  rates: DailyRate[],
  args: {
    date: string
    party_type: PartyType
    party_id: number
    kind: RateKind
  }
): number | undefined {
  return findRate(rates, args)?.value
}

/** Caller must supply the conduit seller id, e.g. from
 *  useActiveSellers().data?.find(s => s.isSettlementConduit). */
export function findConduitUsdtRate(
  rates: DailyRate[],
  date: string,
  conduitSellerId: number | undefined
): number | undefined {
  if (conduitSellerId === undefined) return undefined
  return findRateValue(rates, {
    date,
    party_type: "SELLER",
    party_id: conduitSellerId,
    kind: "USDT",
  })
}

export function findConduitSeller(sellers: Seller[]): Seller | undefined {
  return sellers.find((s) => s.isSettlementConduit)
}
