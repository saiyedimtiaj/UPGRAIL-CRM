"use client"

import { motion } from "motion/react"
import { Send } from "lucide-react"

import { staggerChild, staggerParent } from "@/lib/animations"
import { initials } from "@/lib/format"
import { useStatementPreview } from "@/features/use-statements"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { SubmitButton } from "@/components/primitives/submit-button"
import { Alert } from "@/components/shared/alert"
import type { StatementRow } from "@/services/statements.api"
import { StatementStatusBadge } from "./statement-status-badge"
import { DueAdvance } from "./due-advance"

/**
 * A drawer showing what a client would actually receive.
 *
 * A side-by-side column was too narrow for this content at any styling — the
 * fix was room, not decoration. This slides in from the right with the full
 * width a statement deserves, and the table underneath stays full-width and
 * uncramped the rest of the time.
 */
export function StatementPreview({
  row,
  date,
  open,
  onOpenChange,
  onSend,
  isSending,
}: {
  row: StatementRow | null
  date: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSend: (clientId: number) => void
  isSending: boolean
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto p-0 sm:max-w-lg"
      >
        {row && (
          <PreviewBody
            key={row.client_id}
            row={row}
            date={date}
            onSend={onSend}
            isSending={isSending}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}

function PreviewBody({
  row,
  date,
  onSend,
  isSending,
}: {
  row: StatementRow
  date: string
  onSend: (clientId: number) => void
  isSending: boolean
}) {
  const { data, isPending } = useStatementPreview(row.client_id, date)

  return (
    <>
      <SheetHeader className="border-b border-zinc-100 pb-4">
        <div className="flex items-center justify-between gap-3 pr-8">
          <div className="min-w-0">
            <SheetTitle className="truncate">{row.client_name}</SheetTitle>
            <SheetDescription className="truncate">
              {row.client_company} · {date}
            </SheetDescription>
          </div>
          <StatementStatusBadge row={row} />
        </div>
      </SheetHeader>

      <motion.div
        variants={staggerParent}
        initial="hidden"
        animate="show"
        className="space-y-5 p-5"
      >
        {/* Hero — the one figure the whole feature exists to communicate. */}
        <motion.div
          variants={staggerChild}
          className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-brand-card p-6"
        >
          <div className="pointer-events-none absolute -top-14 -right-14 h-40 w-40 rounded-full bg-emerald-500/20 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 font-mono text-sm font-bold text-emerald-400 ring-1 ring-emerald-500/25">
              {initials(row.client_name)}
            </span>
            <div className="min-w-0">
              <div className="truncate text-base font-bold text-white">
                {row.client_name}
              </div>
              <div className="truncate text-xs text-zinc-400">
                {row.client_company}
              </div>
            </div>
          </div>

          <div className="relative mt-5">
            <span className="text-[11px] font-semibold tracking-wide text-emerald-400/80 uppercase">
              Closing Balance
            </span>
            <DueAdvance
              value={row.closing_balance}
              className="mt-1 block text-[34px] leading-none font-black text-white"
            />
          </div>
        </motion.div>

        {/* The arithmetic, shown as arithmetic. */}
        <motion.div
          variants={staggerChild}
          className="space-y-2 rounded-xl bg-slate-50 px-5 py-4"
        >
          <FigureRow label="Opening" value={row.opening_balance} />
          <FigureRow label="Today's charges" value={row.todays_amount} sign="+" />
          <FigureRow
            label="Payment received"
            value={row.payment_received}
            sign="−"
          />
          <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2 text-sm font-bold text-slate-900">
            <span>Closing</span>
            <DueAdvance value={row.closing_balance} showWord={false} />
          </div>
        </motion.div>

        {row.has_drift && (
          <motion.div variants={staggerChild}>
            <Alert
              variant="warning"
              title="Figures have changed since this was sent"
              message="Re-send to give the client the current numbers."
            />
          </motion.div>
        )}

        {/* The message, in a phone mockup — what actually lands on their screen. */}
        <motion.div variants={staggerChild}>
          {isPending || !data ? (
            <Skeleton className="h-64 w-full rounded-2xl" />
          ) : (
            <PhoneMockup
              text={data.sent_message_text ?? data.message_text}
              connected={row.telegram.connected}
            />
          )}
        </motion.div>

        {data?.sent_message_text && (
          <motion.p variants={staggerChild} className="text-[11px] text-slate-400">
            Showing the message as delivered. A sent statement is never
            rewritten, even if the underlying figures move.
          </motion.p>
        )}

        <motion.div variants={staggerChild}>
          <SubmitButton
            className="w-full gap-1.5"
            disabled={!row.telegram.connected}
            isSubmitting={isSending}
            pendingLabel="Sending…"
            onClick={() => onSend(row.client_id)}
          >
            <Send className="h-3.5 w-3.5" />
            {row.statement?.status === "SENT" ? "Re-send" : "Send on Telegram"}
          </SubmitButton>

          {!row.telegram.connected && (
            <p className="mt-2 text-center text-[11px] text-slate-400">
              {row.client_name} has not connected Telegram yet.
            </p>
          )}
        </motion.div>
      </motion.div>
    </>
  )
}

function FigureRow({
  label,
  value,
  sign,
}: {
  label: string
  value: number
  sign?: "+" | "−"
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span
        className={
          sign === "−"
            ? "font-mono font-semibold text-emerald-700"
            : "font-mono font-semibold text-slate-700"
        }
      >
        {sign}{" "}
        {new Intl.NumberFormat("en-US").format(Math.round(Math.abs(value)))}
      </span>
    </div>
  )
}

/**
 * A small device frame around the Telegram bubble, so an operator sees what
 * actually lands on the client's phone rather than a plain grey box of text.
 */
function PhoneMockup({
  text,
  connected,
}: {
  text: string
  connected: boolean
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-brand-ink p-3">
      <div className="mb-2 flex items-center gap-2 px-1">
        <span className="relative flex h-2 w-2">
          <span
            className={
              connected
                ? "absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"
                : "hidden"
            }
          />
          <span
            className={
              connected
                ? "relative inline-flex h-2 w-2 rounded-full bg-emerald-400"
                : "relative inline-flex h-2 w-2 rounded-full bg-zinc-600"
            }
          />
        </span>
        <span className="text-[11px] font-semibold text-zinc-400">
          {connected ? "Delivered to Telegram" : "Preview — not connected"}
        </span>
      </div>

      <div className="rounded-2xl bg-[#0e1a14] p-3">
        <div className="max-w-full rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap text-slate-800 shadow-sm">
          {renderTelegramHtml(text)}
        </div>
      </div>
    </div>
  )
}

function renderTelegramHtml(text: string) {
  // Split on the two tags the message template uses, keeping the delimiters.
  const parts = text.split(/(<\/?[bi]>)/)
  const nodes: React.ReactNode[] = []
  let bold = 0
  let italic = 0

  parts.forEach((part, index) => {
    if (part === "<b>") return void bold++
    if (part === "</b>") return void (bold = Math.max(0, bold - 1))
    if (part === "<i>") return void italic++
    if (part === "</i>") return void (italic = Math.max(0, italic - 1))
    if (!part) return

    const value = decodeEntities(part)
    nodes.push(
      <span
        key={index}
        className={[
          bold > 0 ? "font-bold text-slate-900" : "",
          italic > 0 ? "italic text-slate-500" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {value}
      </span>,
    )
  })

  return nodes
}

/** The backend escapes &, < and > before sending; undo that for display. */
function decodeEntities(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
}
