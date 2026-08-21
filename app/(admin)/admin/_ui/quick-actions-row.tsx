import Link from "next/link"
import { Coins, HandCoins, Zap } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

const ACTIONS = [
  { href: "/admin/trades", label: "New Trade", icon: Zap },
  { href: "/admin/payments", label: "Log Payment", icon: HandCoins },
  { href: "/admin/settlements", label: "New Settlement", icon: Coins },
]

export function QuickActionsRow() {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {ACTIONS.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
        >
          <action.icon className="h-3.5 w-3.5" />
          {action.label}
        </Link>
      ))}
    </div>
  )
}
