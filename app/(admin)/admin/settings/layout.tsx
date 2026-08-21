import { SettingsNav } from "./_ui/settings-nav"

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full space-y-5 p-4 sm:space-y-6 sm:p-6">
      <SettingsNav />
      {children}
    </div>
  )
}
