"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users2, UserCircle2, Database, SlidersHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"

const SETTINGS_TABS = [
  { href: "/admin/settings/team", label: "Team", icon: Users2 },
  { href: "/admin/settings/business", label: "Business Rules", icon: SlidersHorizontal },
  { href: "/admin/settings/account", label: "Account", icon: UserCircle2 },
  { href: "/admin/settings/system", label: "System", icon: Database },
] as const

export function SettingsNav() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-zinc-200 pb-px">
      {SETTINGS_TABS.map((tab) => {
        const isActive = pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors",
              isActive
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
