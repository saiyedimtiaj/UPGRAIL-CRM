import { ProfileCard } from "./_ui/profile-card"
import { ChangePasswordForm } from "./_ui/change-password-form"

export default function AccountSettingsPage() {
  return (
    <div className="space-y-6">
      <ProfileCard />
      <ChangePasswordForm />
    </div>
  )
}
