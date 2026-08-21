

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
