// The one meaningful seller-type distinction left under the v3.0 pricing
// model (spec §7): the settlement conduit vs. every external seller. Shared
// by the Sellers table and the seller detail page.
export function SellerKindPill({ isSettlementConduit }: { isSettlementConduit: boolean }) {
  return (
    <span
      className={
        isSettlementConduit
          ? "rounded-md border border-violet-200/60 bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-800"
          : "rounded-md border border-amber-200/60 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800"
      }
    >
      {isSettlementConduit ? "Settlement Conduit" : "External Seller"}
    </span>
  )
}
