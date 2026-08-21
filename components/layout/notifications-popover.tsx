"use client"

import Link from "next/link"
import { Bell, Check } from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { shortDateTime } from "@/lib/date"
import { cn } from "@/lib/utils"
import type { NotificationType } from "@/lib/types"
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from "@/features/use-notifications"

const TYPE_DOT: Record<NotificationType, string> = {
  TRADE_CREATED: "bg-sky-500",
  TRADE_FINALIZED: "bg-emerald-500",
  TRADE_VOIDED: "bg-red-500",
  RATE_UPDATED: "bg-amber-500",
  PAYMENT_RECORDED: "bg-emerald-500",
  SETTLEMENT_RECORDED: "bg-violet-500",
  TRANSFER_RECORDED: "bg-rose-500",
}

export function NotificationsPopover() {
  const { data } = useNotifications({ page: 1, limit: 8 })
  const { data: unread } = useUnreadNotificationCount()
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  const recent = data?.data ?? []
  const unreadCount = unread?.count ?? 0

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[9px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        }
      />
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
          <p className="text-sm font-bold text-slate-900">Notifications</p>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead.mutate()}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800"
            >
              <Check className="h-3 w-3" />
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-96 divide-y divide-zinc-100 overflow-y-auto">
          {recent.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-slate-400">
              No notifications yet.
            </p>
          ) : (
            recent.map((n) => (
              <button
                key={n.id}
                onClick={() => !n.read_at && markRead.mutate(n.id)}
                className={cn(
                  "flex w-full items-start gap-2.5 px-4 py-3 text-left transition-colors hover:bg-slate-50/80",
                  !n.read_at && "bg-emerald-50/40"
                )}
              >
                <span
                  className={cn(
                    "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                    n.read_at ? "bg-slate-200" : TYPE_DOT[n.type]
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-bold text-slate-900">
                      {n.title}
                    </p>
                    <span className="shrink-0 text-[10px] text-slate-400">
                      {shortDateTime(n.created_at)}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-xs text-slate-600">
                    {n.body}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
        <div className="border-t border-zinc-100 px-4 py-2.5">
          <Link
            href="/admin/audit"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
          >
            View Full Audit Trail →
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
