import { api } from "@/lib/axios"
import type { PaginatedResponse } from "@/lib/types"

/** Whether a client can be reached on Telegram. */
export type TelegramLinkStatus =
  | "NOT_INVITED"
  | "PENDING"
  | "CONNECTED"
  | "REVOKED"

export type StatementSendStatus = "PENDING" | "SENDING" | "SENT" | "FAILED"

export interface StatementRow {
  client_id: number
  client_name: string
  client_company: string
  opening_balance: number
  todays_amount: number
  payment_received: number
  closing_balance: number
  telegram: {
    status: TelegramLinkStatus
    username: string | null
    token_hint: string | null
    connected: boolean
  }
  statement: {
    id: number
    status: StatementSendStatus
    sent_at: string | null
    attempt_count: number
    last_error: string | null
  } | null
  /** The figures have moved since this was sent — worth re-sending. */
  has_drift: boolean
  live_closing_balance: number
}

export interface StatementTotals {
  opening: number
  todays_amount: number
  payment_received: number
  closing: number
  clients: number
  sent: number
  not_connected: number
}

export type StatementsResponse = PaginatedResponse<StatementRow> & {
  totals: StatementTotals
}

export interface StatementListParams {
  date: string
  page?: number
  limit?: number
  search?: string
  status?: string
}

export async function getStatements(
  params: StatementListParams,
): Promise<StatementsResponse> {
  const { data } = await api.get("/statements", { params })
  return data
}

export interface StatementPreview {
  client_id: number
  client_name: string
  date: string
  opening_balance: number
  todays_amount: number
  payment_received: number
  closing_balance: number
  message_text: string
  is_sent: boolean
  /** What was actually delivered, when it differs from the live figures. */
  sent_message_text: string | null
}

export async function previewStatement(
  clientId: number,
  date: string,
): Promise<StatementPreview> {
  const { data } = await api.get("/statements/preview", {
    params: { clientId, date },
  })
  return data
}

export interface TelegramStatus {
  configured: boolean
  bot_username: string | null
}

export async function getTelegramStatus(): Promise<TelegramStatus> {
  const { data } = await api.get("/statements/telegram/status")
  return data
}

export interface BulkRunProgress {
  runId: string
  date: string
  status: "RUNNING" | "DONE"
  total: number
  sent: number
  failed: number
  skipped: number
  startedAt: string
  finishedAt?: string
}

export async function sendStatement(payload: {
  clientId: number
  date: string
}): Promise<{ status: string; detail?: string }> {
  const { data } = await api.post("/statements/send", payload)
  return data
}

export async function sendStatementsBulk(payload: {
  date: string
  clientIds?: number[]
}): Promise<BulkRunProgress> {
  const { data } = await api.post("/statements/send-bulk", payload)
  return data
}

export async function getBulkRun(runId: string): Promise<BulkRunProgress> {
  const { data } = await api.get(`/statements/runs/${runId}`)
  return data
}

export async function markStatementSent(
  id: number,
): Promise<{ id: number; status: string }> {
  const { data } = await api.patch(`/statements/${id}/mark-sent`)
  return data
}

export interface TelegramInvite {
  invite_url: string | null
  token_hint: string
  bot_username: string | null
}

export async function issueTelegramInvite(
  clientId: number,
): Promise<TelegramInvite> {
  const { data } = await api.post(`/statements/telegram/link/${clientId}`)
  return data
}

export async function revokeTelegramLink(
  clientId: number,
): Promise<{ message: string }> {
  const { data } = await api.patch(
    `/statements/telegram/link/${clientId}/revoke`,
  )
  return data
}

export interface ConnectByChatIdResult {
  telegram_name: string | null
}

/**
 * Connects a client using a chat id they already have, instead of relaying an
 * invite link. The server verifies the id with Telegram before saving it, so
 * a mistyped id is rejected here rather than failing silently on every future
 * send.
 */
export async function connectTelegramByChatId(
  clientId: number,
  chatId: string,
): Promise<ConnectByChatIdResult> {
  const { data } = await api.post(
    `/statements/telegram/link/${clientId}/chat-id`,
    { chatId },
  )
  return data
}
