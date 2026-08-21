import { QuickActionsRow } from "@/app/(admin)/admin/_ui/quick-actions-row"
import { KpiRow } from "@/app/(admin)/admin/_ui/kpi-row"
import { VolumeSpreadSection } from "@/app/(admin)/admin/_ui/volume-spread-section"
import { RegionalSourcingTable } from "@/app/(admin)/admin/_ui/regional-sourcing-table"

export default function DashboardPage() {
  return (
    <div className="w-full space-y-5 p-4 sm:space-y-6 sm:p-6">
      <QuickActionsRow />
      <KpiRow />
      <VolumeSpreadSection />
      <RegionalSourcingTable />
    </div>
  )
}
