"use client"

import * as React from "react"
import { toast } from "sonner"
import { Check, Copy, Link2, Send, X } from "lucide-react"

import { todayISO } from "@/lib/date"
import { initials } from "@/lib/format"
import { getErrorMessage } from "@/lib/handleError"
import {
  useIssueTelegramInvite,
  useRevokeTelegramLink,
  useStatements,
  useTelegramStatus,
} from "@/features/use-statements"
import { SectionCard } from "@/components/primitives/section-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/shared/alert"
import DataTable, {
  type DataTableColumn,
} from "@/components/shared/data-table"
import type { StatementRow } from "@/services/statements.api"
import { usePermissions } from "@/hooks/use-permission"

export function TelegramSettings() {
  const { can } = usePermissions()
  const isOwner = can("settings.telegram")
  const { data: status, isPending } = useTelegramStatus()

  return (
    <div className="space-y-6">
      <SectionCard
        title="Bot Connection"
        subtitle="How statements reach your clients"
      >
        {isPending || !status ? (
          <Skeleton className="h-20 rounded-xl" />
        ) : status.configured ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
              <Check className="h-4 w-4" />
              Connected
              {status.bot_username ? ` · @${status.bot_username}` : ""}
            </div>
            <p className="mt-1 text-[11px] text-emerald-700/80">
              {status.bot_username
                ? "Clients who tap an invite link will receive their daily statements here."
                : "Set TELEGRAM_BOT_USERNAME so invite links can be generated."}
            </p>
          </div>
        ) : (
          <Alert
            variant="warning"
            title="Telegram is not configured"
            message="Statements are still calculated and can be reviewed, but cannot be delivered. Create a bot with @BotFather, then set TELEGRAM_BOT_TOKEN and TELEGRAM_BOT_USERNAME in the API environment and restart."
          />
        )}

        <p className="mt-4 text-[11px] text-slate-400">
          The bot token lives in the server environment, never in this
          screen — it is a credential, and these settings are readable by
          every signed-in user.
        </p>
      </SectionCard>

      <ClientConnections isOwner={isOwner} />
    </div>
  )
}

/**
 * Every client and whether the bot can reach them.
 *
 * Reuses the statements endpoint rather than adding another: it already
 * returns each client's link state, and the date only affects figures that are
 * ignored here.
 */
function ClientConnections({ isOwner }: { isOwner: boolean }) {
  const { data, isPending } = useStatements({ date: todayISO(), limit: 200 })
  const issue = useIssueTelegramInvite()
  const revoke = useRevokeTelegramLink()
  const [copiedFor, setCopiedFor] = React.useState<number | null>(null)

  async function handleInvite(row: StatementRow) {
    try {
      const result = await issue.mutateAsync(row.client_id)
      if (!result.invite_url) {
        toast.error(
          "Set TELEGRAM_BOT_USERNAME on the server to generate invite links.",
        )
        return
      }
      await navigator.clipboard.writeText(result.invite_url)
      setCopiedFor(row.client_id)
      toast.success(`Invite link for ${row.client_name} copied.`)
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not create an invite link."))
    }
  }

  async function handleRevoke(row: StatementRow) {
    try {
      await revoke.mutateAsync(row.client_id)
      toast.success(`${row.client_name} disconnected.`)
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not disconnect."))
    }
  }

  const columns: DataTableColumn<StatementRow>[] = [
    {
      key: "client",
      header: "Client",
      cell: (r) => (
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 font-mono text-[10px] font-bold text-emerald-700">
            {initials(r.client_name)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-slate-900">
              {r.client_name}
            </span>
            <span className="block truncate text-[11px] text-slate-400">
              {r.client_company}
            </span>
          </span>
        </div>
      ),
    },
    {
      key: "state",
      header: "Telegram",
      cell: (r) =>
        r.telegram.connected ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <Send className="h-3 w-3" />
            Connected
            {r.telegram.username ? ` · @${r.telegram.username}` : ""}
          </span>
        ) : r.telegram.status === "PENDING" ? (
          <span className="text-xs font-semibold text-amber-700">
            Invite sent · …{r.telegram.token_hint}
          </span>
        ) : r.telegram.status === "REVOKED" ? (
          <span className="text-xs font-semibold text-rose-600">
            Disconnected
          </span>
        ) : (
          <span className="text-xs text-slate-400">Not invited</span>
        ),
    },
    {
      key: "actions",
      header: "Action",
      align: "right",
      cell: (r) =>
        isOwner ? (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1 px-2 text-[11px]"
              disabled={issue.isPending}
              onClick={() => handleInvite(r)}
            >
              {copiedFor === r.client_id ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              {r.telegram.connected ? "New link" : "Copy invite"}
            </Button>
            {r.telegram.connected && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1 px-2 text-[11px]"
                disabled={revoke.isPending}
                onClick={() => handleRevoke(r)}
              >
                <X className="h-3 w-3" />
                Disconnect
              </Button>
            )}
          </div>
        ) : null,
    },
  ]

  return (
    <SectionCard
      title="Client Connections"
      subtitle="A client must tap an invite link once before statements can reach them"
    >
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        rowKey={(r) => r.client_id}
        isLoading={isPending}
        entityLabel="clients"
        emptyState={
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Link2 className="h-5 w-5 text-slate-300" />
            <p className="text-sm text-slate-400">No clients yet.</p>
          </div>
        }
      />
    </SectionCard>
  )
}
