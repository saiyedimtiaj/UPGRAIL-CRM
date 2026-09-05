import { api } from "@/lib/axios"
import type { PaginatedResponse, ProfitStatus, Transaction } from "@/lib/types"

export interface TransactionListParams {
  page?: number
  limit?: number

  date?: string
  dateFrom?: string
  dateTo?: string
  clientId?: number
  sellerId?: number
  /** A single status, or several — the API accepts a comma-separated list. */
  profitStatus?: ProfitStatus | ProfitStatus[]
  voided?: boolean
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface TransactionStats {
  total: number
  finalized: number
  finalized_percent: number
  awaiting_settlement: number
  awaiting_settlement_percent: number
  partial_settlement: number
  partial_settlement_percent: number
  awaiting_rate: number
  awaiting_rate_percent: number
  cancelled: number
  cancelled_percent: number
}

export async function getTransactionStats(
  params: Omit<TransactionListParams, "page" | "limit" | "profitStatus" | "voided" | "sortBy" | "sortOrder"> = {}
): Promise<TransactionStats> {
  const { data } = await api.get("/transactions/stats", { params })
  return data
}

export async function getTransactions(
  params: TransactionListParams = {},
): Promise<PaginatedResponse<Transaction>> {
  const { data } = await api.get("/transactions", { params })
  return data
}

export async function getTransaction(id: number): Promise<Transaction> {
  const { data } = await api.get(`/transactions/${id}`)
  return data
}

export interface CreateTransactionPayload {
  clientId: number
  sellerId: number
  usdAmount: number

  cardRate: number
  date?: string
  clientRate?: number
  notes?: string
}

export async function createTransaction(payload: CreateTransactionPayload): Promise<Transaction> {
  const { data } = await api.post("/transactions", payload)
  return data
}

export async function updateTransaction(
  id: number,
  payload: { usdAmount?: number; notes?: string },
): Promise<Transaction> {
  const { data } = await api.patch(`/transactions/${id}`, payload)
  return data
}

export async function voidTransaction(id: number, reason: string): Promise<Transaction> {
  const { data } = await api.patch(`/transactions/${id}/void`, { reason })
  return data
}

export async function unvoidTransaction(id: number, reason: string): Promise<Transaction> {
  const { data } = await api.patch(`/transactions/${id}/unvoid`, { reason })
  return data
}

export async function deleteTransaction(id: number): Promise<{ message: string }> {
  const { data } = await api.delete(`/transactions/${id}`)
  return data
}
