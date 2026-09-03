import { SellersStats } from "@/app/(admin)/admin/sellers/_ui/sellers-stats"
import { SellersTable } from "@/app/(admin)/admin/sellers/_ui/sellers-table"

export default function SellersPage() {
  return (
    <div className="w-full space-y-5 p-4 sm:space-y-6 sm:p-6">
      <SellersStats />
      <SellersTable />
    </div>
  )
}
