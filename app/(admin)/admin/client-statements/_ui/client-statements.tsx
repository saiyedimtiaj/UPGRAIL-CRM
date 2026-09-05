"use client"

import * as React from "react"
import { toast } from "sonner"
import { ArrowDownLeft, Link2, Send, Wallet, Zap } from "lucide-react"

import { todayISO } from "@/lib/date"
import { bdt, initials } from "@/lib/format"
import { getErrorMessage } from "@/lib/handleError"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useUrlFilters } from "@/hooks/use-url-filters"
import { usePermissions } from "@/hooks/use-permission"
import {
  useBulkRun,
  useSendStatement,
  useSendStatementsBulk,
  useStatements,
  useTelegramStatus,
} from "@/features/use-statements"
import { PAGE_SIZE, toDataTablePagination } from "@/lib/pagination"
import { StatCard } from "@/components/primitives/stat-card"
import { FilterPills } from "@/components/primitives/filter-pills"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/shared/alert"
import DataTable, {
  type DataTableColumn,
} from "@/components/shared/data-table"
import { FilterBar, type FilterFieldDef } from "@/components/shared/filter-bar"
import { Bdt } from "@/components/primitives/money"
import type { StatementRow } from "@/services/statements.api"
import { StatementStatusBadge } from "./statement-status-badge"
import { DueAdvance } from "./due-advance"
import { StatementPreview } from "./statement-preview"
import { ConnectTelegramModal } from "./connect-telegram-modal"

/**
 * The date is seeded with today rather than left empty: useUrlFilters strips
 * empty strings from the URL, so a blank default would never reach the query
 * and the Reset button could never become active.
 */
const EMPTY_FILTERS = {
  date: todayISO(),
  search: "",
}

type StatusTab = "all" | "sent" | "not_sent" | "failed" | "not_connected"

const STATUS_TABS: { value: StatusTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "sent", label: "Sent" },
  { value: "not_sent", label: "Not Sent" },
  { value: "failed", label: "Failed" },
  { value: "not_connected", label: "Not Connected" },
]

export function ClientStatements() {
  const { filters, setFilters, reset, isDirty } = useUrlFilters(EMPTY_FILTERS)
  const debouncedSearch = useDebouncedValue(filters.search)
  const [status, setStatus] = React.useState<StatusTab>("all")
  const [page, setPage] = React.useState(1)
  const [selectedId, setSelectedId] = React.useState<number | null>(null)
  const [connectTarget, setConnectTarget] = React.useState<StatementRow | null>(
    null,
  )
  const [runId, setRunId] = React.useState<string | null>(null)
  const { can } = usePermissions()
  const canSend = can("client_statements.send")

  const { data: telegram } = useTelegramStatus()
  const sendOne = useSendStatement()
  const sendBulk = useSendStatementsBulk()
  const { data: run } = useBulkRun(runId)

  const query = {
    date: filters.date || todayISO(),
    search: debouncedSearch || undefined,
    status: status === "all" ? undefined : status,
  }

  // Any change to what is being asked for invalidates the page number.
  const filterKey = JSON.stringify(query)
  const [seenKey, setSeenKey] = React.useState(filterKey)
  if (seenKey !== filterKey) {
    setSeenKey(filterKey)
    if (page !== 1) setPage(1)
  }

  const { data, isPending, isFetching } = useStatements({
    ...query,
    page,
    limit: PAGE_SIZE,
  })

  const rows = data?.data ?? []
  const totals = data?.totals
  const selected = rows.find((r) => r.client_id === selectedId) ?? null

  // A finished run reports its outcome once, then clears itself.
  const [reportedRun, setReportedRun] = React.useState<string | null>(null)
  if (run?.status === "DONE" && reportedRun !== run.runId) {
    setReportedRun(run.runId)
    toast.success(
      `Sent ${run.sent} of ${run.total}` +
        (run.failed ? ` · ${run.failed} failed` : "") +
        (run.skipped ? ` · ${run.skipped} already sent` : ""),
    )
  }

  async function handleSendOne(clientId: number) {
    try {
      const result = await sendOne.mutateAsync({
        clientId,
        date: query.date,
      })
      if (result.status === "SENT") toast.success("Statement sent.")
      else if (result.status === "SKIPPED")
        toast.info("Already sent for this date.")
      else toast.error(result.detail ?? "Could not send.")
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not send the statement."))
    }
  }

  async function handleSendAll() {
    try {
      const started = await sendBulk.mutateAsync({ date: query.date })
      setRunId(started.runId)
      if (started.total === 0) {
        toast.info("Every connected client already has this date's statement.")
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not start the send."))
    }
  }

  const filterFields: FilterFieldDef[] = [
    {
      kind: "search",
      key: "search",
      label: "Search",
      placeholder: "Search by client or company…",
    },
    { kind: "date", key: "date", label: "Business Date" },
  ]

  const columns: DataTableColumn<StatementRow>[] = [
    {
      key: "client",
      header: "Client",
      cell: (r) => (
        <button
          type="button"
          onClick={() => setSelectedId(r.client_id)}
          className="flex cursor-pointer items-center gap-2.5 text-left"
        >
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
        </button>
      ),
    },
    {
      key: "opening",
      header: "Opening",
      align: "right",
      hideBelow: "lg",
      cell: (r) => <DueAdvance value={r.opening_balance} showWord={false} />,
    },
    {
      key: "todays",
      header: "Today's",
      align: "right",
      cell: (r) => <Bdt value={r.todays_amount} />,
    },
    {
      key: "received",
      header: "Received",
      align: "right",
      cell: (r) => (
        <span className="font-mono tabular-nums text-emerald-700">
          {bdt(r.payment_received)}
        </span>
      ),
    },
    {
      key: "closing",
      header: "Closing",
      align: "right",
      cell: (r) => (
        <DueAdvance value={r.closing_balance} className="font-bold" />
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => (
        <div className="space-y-0.5">
          <StatementStatusBadge row={r} />
          {r.has_drift && (
            <span className="block text-[10px] font-semibold text-amber-600">
              figures changed
            </span>
          )}
          {r.statement?.last_error && (
            <span className="block max-w-40 truncate text-[10px] text-rose-500">
              {r.statement.last_error}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Action",
      align: "right",
      cell: (r) =>
        canSend ? (
          <div className="flex items-center justify-end gap-1.5">
            {r.telegram.connected ? (
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1 px-2 text-[11px]"
                disabled={sendOne.isPending}
                onClick={() => handleSendOne(r.client_id)}
              >
                <Send className="h-3 w-3" />
                {r.statement?.status === "SENT" ? "Re-send" : "Send"}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1 px-2 text-[11px]"
                onClick={() => setConnectTarget(r)}
              >
                <Link2 className="h-3 w-3" />
                Connect
              </Button>
            )}
          </div>
        ) : null,
    },
  ]

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          accent="sky"
          icon={Wallet}
          label="Opening Total"
          value={totals?.opening ?? 0}
          format={(n) => bdt(n)}
          footer={
            <span className="text-[11px] font-semibold text-slate-500">
              Owed before the day began
            </span>
          }
        />
        <StatCard
          accent="violet"
          icon={Zap}
          label="Today's Charges"
          value={totals?.todays_amount ?? 0}
          format={(n) => bdt(n)}
          footer={
            <span className="text-[11px] font-semibold text-slate-500">
              Posted on this date
            </span>
          }
        />
        <StatCard
          accent="emerald"
          icon={ArrowDownLeft}
          label="Payments Received"
          value={totals?.payment_received ?? 0}
          format={(n) => bdt(n)}
          footer={
            <span className="text-[11px] font-semibold text-slate-500">
              Collected on this date
            </span>
          }
        />
        <StatCard
          accent="amber"
          icon={Wallet}
          label="Closing Total"
          value={totals?.closing ?? 0}
          format={(n) => bdt(n)}
          footer={
            <span className="text-[11px] font-semibold text-slate-500">
              {totals ? `${totals.sent} of ${totals.clients} sent` : "—"}
            </span>
          }
        />
      </div>

      {telegram && !telegram.configured && (
        <Alert
          variant="info"
          title="Telegram is not configured"
          message="Statements are still calculated and can be reviewed here. Set TELEGRAM_BOT_TOKEN and TELEGRAM_BOT_USERNAME on the server to enable sending."
        />
      )}

      {run?.status === "RUNNING" && (
        <Alert
          variant="info"
          title={`Sending — ${run.sent + run.failed + run.skipped} of ${run.total}`}
          message="Pacing under Telegram's rate limit, so this takes a moment. You can keep working."
        />
      )}

      <DataTable
        columns={columns}
        data={rows}
        rowKey={(r) => r.client_id}
        isLoading={isPending}
        entityLabel="clients"
        pagination={toDataTablePagination(data?.meta)}
        onPageChange={setPage}
        rowClassName={(r) =>
          r.client_id === selectedId ? "bg-emerald-50/40" : ""
        }
        toolbar={
          <div className="space-y-3">
            <FilterBar
              fields={filterFields}
              value={filters}
              onChange={setFilters}
              onReset={reset}
              isDirty={isDirty}
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <FilterPills
                value={status}
                onChange={setStatus}
                options={STATUS_TABS}
              />
              {canSend && (
                <Button
                  size="sm"
                  className="gap-1.5"
                  disabled={sendBulk.isPending || run?.status === "RUNNING"}
                  onClick={handleSendAll}
                >
                  <Send className="h-3.5 w-3.5" />
                  Send today&rsquo;s statements
                </Button>
              )}
            </div>
          </div>
        }
        footerLeft={
          isFetching && !isPending ? (
            <span className="text-xs text-slate-400">Updating…</span>
          ) : undefined
        }
      />

      <StatementPreview
        row={selected}
        date={query.date}
        open={selectedId !== null}
        onOpenChange={(open) => !open && setSelectedId(null)}
        onSend={handleSendOne}
        isSending={sendOne.isPending}
      />

      <ConnectTelegramModal
        row={connectTarget}
        botUsername={telegram?.bot_username ?? null}
        open={connectTarget !== null}
        onOpenChange={(open) => !open && setConnectTarget(null)}
      />
    </>
  )
}
