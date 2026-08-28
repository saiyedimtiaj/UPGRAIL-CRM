import { ProfileCard } from "./_ui/profile-card"
import { ChangePasswordForm } from "./_ui/change-password-form"
import ComingSoon from "@/components/shared/cooming-soon"

export default function AccountSettingsPage() {
  return <ComingSoon />
  return (
    <div className="space-y-6">
      <ProfileCard />
      <ChangePasswordForm />
    </div>
  )
}
