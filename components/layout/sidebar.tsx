"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "motion/react"
import { LogOut } from "lucide-react"

import { cn } from "@/lib/utils"
import { NAV_INDICATOR_ID } from "@/lib/animations"
import { SETTINGS_NAV_ITEM } from "@/lib/nav"
import { useLogout, useMe } from "@/features/use-auth"
import { SidebarNav } from "@/components/layout/sidebar-nav"
import { AvatarImage } from "@/components/primitives/avatar-image"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { data: currentUser, isPending: userPending } = useMe()
  const logoutMutation = useLogout()
  const router = useRouter()
  const pathname = usePathname()
  const isSettingsActive = pathname.startsWith(SETTINGS_NAV_ITEM.href)

  async function handleLogout() {
    await logoutMutation.mutateAsync().catch(() => undefined)
    router.push("/sign-in")
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4 lg:overflow-visible lg:p-0">
      <div className="space-y-4 border-b border-white/5 pb-3 lg:sticky lg:top-0 lg:z-10 lg:bg-brand-ink lg:p-3">
        <Link
          href="/admin"
          onClick={onNavigate}
          aria-label="AdFund Global — go to dashboard"
          className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1 transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:outline-none"
        >
          <Image
            src="/logo.webp"
            alt="AdFund Global"
            className="h-8 w-auto"
            width={100}
            height={100}
            priority
          />
        </Link>
      </div>

      <div className="flex-1 lg:overflow-y-auto lg:px-4">
        <div className="pt-2">
          <SidebarNav onNavigate={onNavigate} />
        </div>

        <div className="mb-3 pt-2">
          <Link
            href={SETTINGS_NAV_ITEM.href}
            onClick={onNavigate}
            className={cn(
              "relative flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-colors",
              isSettingsActive
                ? "text-white"
                : "text-zinc-400 hover:bg-brand-panel-2 hover:text-white"
            )}
          >
            {isSettingsActive && (
              <motion.span
                layoutId={NAV_INDICATOR_ID}
                className="absolute inset-0 rounded-xl border border-emerald-500/30 bg-brand-active"
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
            <span className="relative z-10 flex items-center gap-3">
              <SETTINGS_NAV_ITEM.icon
                className={cn(
                  "h-4 w-4",
                  isSettingsActive ? "text-emerald-400" : "text-zinc-400"
                )}
              />
              Settings
            </span>
          </Link>
        </div>
      </div>

      <div className="border-t border-white/5 pt-4 lg:sticky lg:bottom-0 lg:z-10 lg:bg-brand-ink lg:p-4 lg:pt-4">
        <div className="flex items-center justify-between rounded-xl border border-white/5 bg-brand-panel-2 p-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="relative">
              <AvatarImage
                src={currentUser?.avatar ?? null}
                name={currentUser?.name ?? ""}
                className="h-9 w-9 ring-2 ring-emerald-500/40"
              />
              <span className="absolute right-0 bottom-0 h-2 w-2 rounded-full bg-emerald-400 ring-1 ring-brand-ink" />
            </div>
            <div className="min-w-0 space-y-1">
              {userPending ? (
                <>
                  <Skeleton className="h-4 w-24 bg-white/10" />
                  <Skeleton className="h-3 w-32 bg-white/10" />
                </>
              ) : (
                <>
                  <div className="truncate text-sm font-bold text-white">
                    {currentUser?.name}
                  </div>
                  <div className="truncate text-xs text-zinc-400">
                    {currentUser?.email}
                  </div>
                </>
              )}
            </div>
          </div>

          <button
            title="Sign Out"
            onClick={handleLogout}
            className="cursor-pointer rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/5 hover:text-rose-400"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-white/5 bg-brand-ink text-slate-300 select-none lg:block">
      <SidebarContent />
    </aside>
  )
}
