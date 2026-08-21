import { SettlementForm } from "@/app/(admin)/admin/settlements/_ui/settlement-form"
import { OutstandingUsdtCard } from "@/app/(admin)/admin/settlements/_ui/outstanding-usdt-card"
import { SettlementsTable } from "@/app/(admin)/admin/settlements/_ui/settlements-table"

export default function SettlementsPage() {
  return (
    <div className="w-full space-y-5 p-4 sm:space-y-6 sm:p-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <SettlementForm />
        </div>
        <div className="lg:col-span-5">
          <OutstandingUsdtCard />
        </div>
      </div>
      <SettlementsTable />
    </div>
  )
}
