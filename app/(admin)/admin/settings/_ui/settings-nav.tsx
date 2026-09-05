"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "motion/react"
import {
  Database,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  UserCircle2,
  Users2,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { EASE } from "@/lib/animations"
import { usePermissions } from "@/hooks/use-permission"

export interface SettingsTab {
  href: string
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  /** Empty means every signed-in user may open it. */
  permission: string
}

export const SETTINGS_TABS: SettingsTab[] = [
  {
    href: "/admin/settings/team",
    label: "Team",
    description: "People with access to this workspace",
    icon: Users2,
    permission: "settings.team",
  },
  {
    href: "/admin/settings/permissions",
    label: "Roles & Permissions",
    description: "Decide what each role can see and do",
    icon: ShieldCheck,
    permission: "settings.roles",
  },
  {
    href: "/admin/settings/business",
    label: "Business Rules",
    description: "Margins, payment methods and dashboard display",
    icon: SlidersHorizontal,
    permission: "settings.business",
  },
  {
    href: "/admin/settings/telegram",
    label: "Telegram",
    description: "Bot connection and client delivery",
    icon: Send,
    permission: "settings.telegram",
  },
  {
    href: "/admin/settings/account",
    label: "Account",
    description: "Your own profile and password",
    icon: UserCircle2,
    permission: "",
  },
  {
    href: "/admin/settings/system",
    label: "System",
    description: "Row counts across every entity",
    icon: Database,
    permission: "settings.system",
  },
]

/** The tabs this role may actually open. */
export function useVisibleSettingsTabs(): SettingsTab[] {
  const { can, isPending } = usePermissions()
  return React.useMemo(() => {
    if (isPending) return []
    return SETTINGS_TABS.filter((t) => !t.permission || can(t.permission))
  }, [can, isPending])
}

const RAIL_INDICATOR = "settings-rail-indicator"

/**
 * A left rail on wide screens, a scrolling strip on narrow ones.
 *
 * The rail gives each tab room for a one-line description, which the old
 * underline strip could not fit — settings screens are infrequent enough that
 * saying what each one does earns its space.
 */
export function SettingsNav() {
  const pathname = usePathname()
  const tabs = useVisibleSettingsTabs()

  if (tabs.length === 0) return null

  return (
    <>
      {/* Wide: a dark sticky rail, matching the main sidebar's own language
          rather than a flat white/grey box. Offset below the topbar (~65px)
          plus the page's own padding, and scrolls internally if the tab list
          ever grows past the viewport. */}
      <nav className="hidden lg:sticky lg:top-[81px] lg:flex lg:h-fit lg:max-h-[calc(100vh-97px)] lg:w-64 lg:shrink-0 lg:flex-col lg:gap-1 lg:overflow-y-auto lg:rounded-card lg:border lg:border-white/5 lg:bg-brand-ink lg:p-3">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "group relative rounded-xl px-3 py-2.5 transition-colors",
                isActive ? "" : "hover:bg-brand-panel-2",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId={RAIL_INDICATOR}
                  className="absolute inset-0 rounded-xl border border-emerald-500/30 bg-brand-active"
                  transition={{ duration: 0.25, ease: EASE }}
                />
              )}
              <span className="relative z-10 flex items-start gap-2.5">
                <span
                  className={cn(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ring-1 transition-colors",
                    isActive
                      ? "bg-emerald-500/15 text-emerald-400 ring-emerald-500/25"
                      : "bg-white/5 text-zinc-400 ring-white/10",
                  )}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block text-sm font-semibold",
                      isActive ? "text-white" : "text-zinc-300",
                    )}
                  >
                    {tab.label}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-zinc-500">
                    {tab.description}
                  </span>
                </span>
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Narrow: the original horizontal strip */}
      <nav className="flex gap-1 overflow-x-auto border-b border-zinc-200 pb-px lg:hidden">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors",
                isActive
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-800",
              )}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
