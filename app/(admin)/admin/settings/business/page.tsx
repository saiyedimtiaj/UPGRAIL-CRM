import { PricingMarginsCard } from "./_ui/pricing-margins-card"
import { PaymentMethodsCard } from "./_ui/payment-methods-card"
import { DashboardDisplayCard } from "./_ui/dashboard-display-card"

export default function BusinessSettingsPage() {
  return (
    <div className="space-y-6">
      <PricingMarginsCard />
      <PaymentMethodsCard />
      <DashboardDisplayCard />
    </div>
  )
}
