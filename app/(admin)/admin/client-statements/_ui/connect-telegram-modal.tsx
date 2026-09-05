"use client"

import * as React from "react"
import { toast } from "sonner"
import { Check, Copy, KeyRound, Link2, Send } from "lucide-react"

import { cn } from "@/lib/utils"
import { getErrorMessage } from "@/lib/handleError"
import {
  useConnectTelegramByChatId,
  useIssueTelegramInvite,
  useRevokeTelegramLink,
} from "@/features/use-statements"
import { Modal } from "@/components/primitives/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SubmitButton } from "@/components/primitives/submit-button"
import { Alert } from "@/components/shared/alert"
import type { StatementRow } from "@/services/statements.api"

type ConnectMethod = "invite" | "chat-id"

/**
 * Connects a client to Telegram.
 *
 * A bot cannot message someone by phone number — it needs a chat id, which
 * only exists once the client has messaged the bot at least once. Two routes
 * get us that id: the operator relays a one-time invite link and the client
 * taps it, or the client messages the bot themselves (it replies with their
 * id) and reads that id back to the operator to paste in. Either way the
 * client has to act once — this only changes how the id reaches us.
 */
export function ConnectTelegramModal({
  row,
  botUsername,
  open,
  onOpenChange,
}: {
  row: StatementRow | null
  botUsername: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const revoke = useRevokeTelegramLink()
  const [method, setMethod] = React.useState<ConnectMethod>("invite")

  // A different client means nothing from the previous one should linger.
  const [seenClient, setSeenClient] = React.useState(row?.client_id)
  if (seenClient !== row?.client_id) {
    setSeenClient(row?.client_id)
    if (method !== "invite") setMethod("invite")
  }

  if (!row) return null

  async function handleRevoke() {
    if (!row) return
    try {
      await revoke.mutateAsync(row.client_id)
      toast.success(`${row.client_name} disconnected from Telegram.`)
      onOpenChange(false)
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not disconnect."))
    }
  }

  const isConnected = row.telegram.connected

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isConnected ? "Telegram Connection" : "Connect Telegram"}
      description={
        isConnected
          ? `${row.client_name} receives statements on Telegram.`
          : `${row.client_name} must reach the bot once before statements can be sent.`
      }
    >
      <div className="space-y-4">
        {!botUsername && (
          <Alert
            variant="warning"
            title="Bot not fully configured"
            message="Set TELEGRAM_BOT_TOKEN and TELEGRAM_BOT_USERNAME on the server before connecting clients."
          />
        )}

        {isConnected ? (
          <>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                <Send className="h-4 w-4" />
                Connected
                {row.telegram.username ? ` · @${row.telegram.username}` : ""}
              </div>
              <p className="mt-1 text-[11px] text-emerald-700/80">
                Daily statements are delivered to this chat.
              </p>
            </div>
            <SubmitButton
              variant="outline"
              className="w-full"
              isSubmitting={revoke.isPending}
              pendingLabel="Disconnecting…"
              onClick={handleRevoke}
            >
              Disconnect
            </SubmitButton>
          </>
        ) : (
          <>
            <div className="inline-flex w-full items-center gap-1 rounded-full border border-zinc-200 bg-white p-1">
              <MethodTab
                active={method === "invite"}
                icon={Link2}
                label="Invite link"
                onClick={() => setMethod("invite")}
              />
              <MethodTab
                active={method === "chat-id"}
                icon={KeyRound}
                label="Chat ID"
                onClick={() => setMethod("chat-id")}
              />
            </div>

            {method === "invite" ? (
              <InviteLinkPanel row={row} botUsername={botUsername} />
            ) : (
              <ChatIdPanel row={row} onConnected={() => onOpenChange(false)} />
            )}
          </>
        )}
      </div>
    </Modal>
  )
}

function MethodTab({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "bg-brand-ink text-white"
          : "text-slate-500 hover:text-slate-800",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  )
}

function InviteLinkPanel({
  row,
  botUsername,
}: {
  row: StatementRow
  botUsername: string | null
}) {
  const issue = useIssueTelegramInvite()
  const [inviteUrl, setInviteUrl] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)

  async function handleIssue() {
    try {
      const result = await issue.mutateAsync(row.client_id)
      setInviteUrl(result.invite_url)
      if (!result.invite_url) {
        toast.error(
          "Set TELEGRAM_BOT_USERNAME on the server to generate invite links.",
        )
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not create an invite link."))
    }
  }

  async function handleCopy() {
    if (!inviteUrl) return
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      toast.success("Invite link copied.")
    } catch {
      toast.error("Could not copy — select the link and copy it by hand.")
    }
  }

  return (
    <div className="space-y-3">
      <ol className="space-y-2 text-xs text-slate-600">
        <li>
          <strong>1.</strong> Generate the invite link below.
        </li>
        <li>
          <strong>2.</strong> Send it to {row.client_name} however you
          normally reach them.
        </li>
        <li>
          <strong>3.</strong> They tap it and press Start. That is the moment
          Telegram tells us their chat, and it only has to happen once.
        </li>
      </ol>

      {inviteUrl ? (
        <div className="space-y-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <code className="text-[11px] break-all text-slate-700">
              {inviteUrl}
            </code>
          </div>
          <Button
            variant="outline"
            className="w-full gap-1.5"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? "Copied" : "Copy link"}
          </Button>
          <p className="text-[11px] text-slate-400">
            Generating a new link invalidates this one.
          </p>
        </div>
      ) : (
        <SubmitButton
          className="w-full"
          disabled={!botUsername}
          isSubmitting={issue.isPending}
          pendingLabel="Generating…"
          onClick={handleIssue}
        >
          {row.telegram.status === "PENDING"
            ? "Generate a new invite link"
            : "Generate invite link"}
        </SubmitButton>
      )}
    </div>
  )
}

function ChatIdPanel({
  row,
  onConnected,
}: {
  row: StatementRow
  onConnected: () => void
}) {
  const connect = useConnectTelegramByChatId()
  const [chatId, setChatId] = React.useState("")
  const [result, setResult] = React.useState<
    { ok: true; name: string | null } | { ok: false; message: string } | null
  >(null)

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = chatId.trim()
    if (!trimmed) return

    setResult(null)
    try {
      const r = await connect.mutateAsync({
        clientId: row.client_id,
        chatId: trimmed,
      })
      setResult({ ok: true, name: r.telegram_name })
      toast.success(`${row.client_name} connected.`)
      // A brief pause lets the operator see the confirmed name before the
      // modal closes under them.
      setTimeout(onConnected, 900)
    } catch (error) {
      setResult({ ok: false, message: getErrorMessage(error, "Could not verify that chat.") })
    }
  }

  return (
    <div className="space-y-3">
      <ol className="space-y-2 text-xs text-slate-600">
        <li>
          <strong>1.</strong> Ask {row.client_name} to message the bot any text
          — even just &ldquo;hi&rdquo;.
        </li>
        <li>
          <strong>2.</strong> The bot replies with their chat ID. They send
          that number to you.
        </li>
        <li>
          <strong>3.</strong> Paste it below. We check it with Telegram
          before saving, so a typo is caught here, not on the next send.
        </li>
      </ol>

      <form onSubmit={handleConnect} className="space-y-2">
        <div className="space-y-1.5">
          <Label htmlFor="telegram-chat-id">Chat ID</Label>
          <Input
            id="telegram-chat-id"
            inputMode="numeric"
            placeholder="e.g. 123456789"
            value={chatId}
            onChange={(e) => {
              setChatId(e.target.value)
              if (result) setResult(null)
            }}
          />
        </div>
        <SubmitButton
          type="submit"
          className="w-full"
          disabled={!chatId.trim()}
          isSubmitting={connect.isPending}
          pendingLabel="Verifying…"
        >
          Verify &amp; Connect
        </SubmitButton>
      </form>

      {result?.ok && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-xs font-semibold text-emerald-800">
          <Check className="h-4 w-4 shrink-0" />
          Connected{result.name ? ` to ${result.name}` : ""}
        </div>
      )}
      {result && !result.ok && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3 text-xs text-rose-700">
          {result.message}
        </div>
      )}
    </div>
  )
}
