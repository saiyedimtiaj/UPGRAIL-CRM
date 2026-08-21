"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { NAV_INDICATOR_ID } from "@/lib/animations"
import { NAV_SECTIONS, type NavItem } from "@/lib/nav"

function NavRow({
  item,
  onNavigate,
}: {
  item: NavItem
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const isActive =
    item.href === "/admin"
      ? pathname === "/admin"
      : pathname.startsWith(item.href)
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "relative flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        isActive
          ? "text-white"
          : "text-zinc-400 hover:bg-brand-panel-2 hover:text-white"
      )}
    >
      {isActive && (
        <motion.span
          layoutId={NAV_INDICATOR_ID}
          className="absolute inset-0 rounded-xl border border-emerald-500/30 bg-brand-active shadow-sm"
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
      <span className="relative z-10 flex items-center gap-3">
        <Icon
          className={cn(
            "h-4 w-4 transition-colors",
            isActive ? "text-emerald-400" : "text-zinc-400"
          )}
        />
        <span className={isActive ? "font-semibold" : undefined}>
          {item.label}
        </span>
      </span>
    </Link>
  )
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="space-y-5">
      {NAV_SECTIONS.map((section) => (
        <div key={section.label} className="space-y-1">
          <p className="px-3 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
            {section.label}
          </p>
          {section.items.map((item) => (
            <NavRow key={item.href} item={item} onNavigate={onNavigate} />
          ))}
        </div>
      ))}
    </nav>
  )
}
