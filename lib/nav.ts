import type { LucideIcon } from "lucide-react"
import {
  ArrowLeftRight,
  Building2,
  Coins,
  FileSpreadsheet,
  FileText,
  History,
  Landmark,
  LayoutDashboard,
  Percent,
  Receipt,
  Settings,
  ShieldAlert,
  Users,
  Wallet,
  Zap,
} from "lucide-react"

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

/** Nav items carry no permission of their own — ROUTE_PERMISSIONS in
 *  lib/route-permissions.ts is the single source, so the sidebar and the page
 *  guard can never disagree about what is visible. */

export interface NavSection {
  label: string
  items: NavItem[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Operations",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/trades", label: "Trades", icon: Zap },
      {
        href: "/admin/transactions",
        label: "Transactions",
        icon: FileText,
      },
      { href: "/admin/rates", label: "Rates", icon: Percent },
      { href: "/admin/rate-history", label: "Rate History", icon: History },
    ],
  },
  {
    label: "Directory",
    items: [
      { href: "/admin/clients", label: "Clients", icon: Users },
      { href: "/admin/sellers", label: "Sellers", icon: Building2 },
      {
        href: "/admin/primary-supplier",
        label: "Primary Supplier",
        icon: Landmark,
      },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/admin/client-ledger", label: "Client Ledgers", icon: Landmark },
      {
        href: "/admin/client-statements",
        label: "Client Statements",
        icon: Receipt,
      },
      { href: "/admin/seller-ledger", label: "Seller Ledgers", icon: Building2 },
      { href: "/admin/payments", label: "Payments", icon: Coins },
      { href: "/admin/settlements", label: "Settlements", icon: Coins },
      { href: "/admin/profit", label: "Profit & Pool", icon: Wallet },
      { href: "/admin/transfers", label: "Transfer Money", icon: ArrowLeftRight },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/reports", label: "Reports", icon: FileSpreadsheet },
      { href: "/admin/audit", label: "Audit Trail", icon: ShieldAlert },
    ],
  },
]

export const NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items)

export const SETTINGS_NAV_ITEM: NavItem = {
  // Lands on a real page rather than an overview: Team is where settings work
  // actually starts.
  href: "/admin/settings/team",
  label: "Settings",
  icon: Settings,
}

export const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/admin": {
    title: "Dashboard",
    subtitle: "Live Institutional Overview & Spread Performance",
  },
  "/admin/transactions": {
    title: "Transactions",
    subtitle: "All client transactions and their current status",
  },
  "/admin/primary-supplier": {
    title: "Primary Supplier",
    subtitle: "Conduit Ledger, Payable & Sourced Trades",
  },
  "/admin/trades": {
    title: "Quick Entry & Trades",
    subtitle: "Rapid Deal Entry & Live Auto-Finalization Engine",
  },
  "/admin/rates": {
    title: "Daily Rate Engine",
    subtitle: "Master Rate Sheet & Multi-Tier Sourcing Quotations",
  },
  "/admin/rate-history": {
    title: "Rate History",
    subtitle: "Full Rate Sheet Log — Edit or Remove Any Entered Rate",
  },
  "/admin/clients": {
    title: "Clients",
    subtitle: "Client Directory — Add, Edit & Deactivate Accounts",
  },
  "/admin/sellers": {
    title: "Sellers",
    subtitle: "Seller Directory — Direct & Card Sourcing Partners",
  },
  "/admin/payments": {
    title: "Payments",
    subtitle: "Inbound & Outbound Payment Log — All Parties",
  },
  "/admin/client-ledger": {
    title: "Client Ledgers",
    subtitle: "Receivables, Running Dues & Payment Inflows",
  },
  "/admin/client-statements": {
    title: "Client Daily Statements",
    subtitle: "Opening, Charges & Closing — Sent to Clients on Telegram",
  },
  "/admin/seller-ledger": {
    title: "Seller Ledgers",
    subtitle: "Direct BDT Payables & Card USDT Balances",
  },
  "/admin/settlements": {
    title: "USDT Settlements",
    subtitle: "Nazmul Conduit & Card Seller USDT Movements",
  },
  "/admin/profit": {
    title: "Profit Pool & Withdrawals",
    subtitle: "Audited Gross vs Realized Withdrawable Capital",
  },
  "/admin/transfers": {
    title: "Transfer Money",
    subtitle: "Move Funds Between Nazmul, UpGrail Bank & Profit Bank",
  },
  "/admin/reports": {
    title: "Reports & CSV Export",
    subtitle: "Audited Financial Logs & Date-Range Export",
  },
  "/admin/audit": {
    title: "System Audit Trail",
    subtitle: "Immutable Ledger of All Rates, Edits & Voids",
  },
  "/admin/settings": {
    title: "System Settings",
    subtitle: "Team Roles, Currency Precision & Environment Config",
  },
}

const DYNAMIC_PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/admin/clients": {
    title: "Client Details",
    subtitle: "Profile, Receivables & Trade/Payment History",
  },
  "/admin/sellers": {
    title: "Seller Details",
    subtitle: "Profile, USDT Balance & Supply/Settlement History",
  },
}

export function resolvePageMeta(pathname: string): { title: string; subtitle: string } {
  const exact = PAGE_META[pathname]
  if (exact) return exact

  const lastSlash = pathname.lastIndexOf("/")
  if (lastSlash > 0) {
    const parent = pathname.slice(0, lastSlash)
    const tail = pathname.slice(lastSlash + 1)
    if (/^\d+$/.test(tail)) {
      const dynamic = DYNAMIC_PAGE_META[parent]
      if (dynamic) return dynamic
    }

    // A named sub-page inherits its parent's heading rather than falling all
    // the way back to the Dashboard — which is what every settings tab used
    // to show.
    const inherited = PAGE_META[parent]
    if (inherited) return inherited
  }

  return PAGE_META["/admin"]
}
