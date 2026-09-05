import { IfPermitted } from "@/components/shared/if-permitted"
import { QuickActionsRow } from "@/app/(admin)/admin/_ui/quick-actions-row"
import { KpiRow } from "@/app/(admin)/admin/_ui/kpi-row"
import { DashboardInsights } from "@/app/(admin)/admin/_ui/dashboard-insights"
import { VolumeSpreadSection } from "@/app/(admin)/admin/_ui/volume-spread-section"
import { RegionalSourcingTable } from "@/app/(admin)/admin/_ui/regional-sourcing-table"

/**
 * Each section is independently permissioned, so a role can be given the
 * dashboard without necessarily seeing profit figures or the regional table.
 */
export default function DashboardPage() {
  return (
    <div className="w-full space-y-5 p-4 sm:space-y-6 sm:p-6">
      <IfPermitted permission="dashboard.section.quick_actions">
        <QuickActionsRow />
      </IfPermitted>
      <IfPermitted permission="dashboard.section.kpi">
        <KpiRow />
      </IfPermitted>
      <IfPermitted permission="dashboard.section.insights">
        <DashboardInsights />
      </IfPermitted>
      <IfPermitted permission="dashboard.section.volume">
        <VolumeSpreadSection />
      </IfPermitted>
      <IfPermitted permission="dashboard.section.regional">
        <RegionalSourcingTable />
      </IfPermitted>
    </div>
  )
}
