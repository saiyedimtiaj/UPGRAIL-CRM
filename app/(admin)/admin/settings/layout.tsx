import { SettingsNav } from "./_ui/settings-nav"

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full p-4 sm:p-6">
      {/* Rail beside the content on wide screens, stacked below lg. */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-8">
        <SettingsNav />
        <div className="min-w-0 flex-1 space-y-5 sm:space-y-6">{children}</div>
      </div>
    </div>
  )
}
