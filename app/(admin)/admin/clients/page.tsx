import { ClientsStats } from "@/app/(admin)/admin/clients/_ui/clients-stats"
import { ClientsTable } from "@/app/(admin)/admin/clients/_ui/clients-table"

export default function ClientsPage() {
  return (
    <div className="w-full space-y-5 p-4 sm:space-y-6 sm:p-6">
      <ClientsStats />
      <ClientsTable />
    </div>
  )
}
