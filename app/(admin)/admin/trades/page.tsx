import { TradeEntryForm } from "@/app/(admin)/admin/trades/_ui/trade-entry-form"
import { TradesTable } from "@/app/(admin)/admin/trades/_ui/trades-table"

export default function TradesPage() {
  return (
    <div className="w-full space-y-5 p-4 sm:space-y-6 sm:p-6">
      <TradeEntryForm />
      <TradesTable />
    </div>
  )
}
