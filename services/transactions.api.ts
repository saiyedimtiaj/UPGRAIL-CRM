import { api } from "@/lib/axios"
import type { PaginatedResponse, ProfitStatus, Transaction } from "@/lib/types"

export interface TransactionListParams {
  page?: number
  limit?: number
  /** Exact-day match; wins over dateFrom/dateTo. */
  date?: string
  dateFrom?: string
  dateTo?: string
  clientId?: number
  sellerId?: number
  profitStatus?: ProfitStatus
  voided?: boolean
  search?: string
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
  /** Percentage, e.g. 92.5 — required on every trade (spec §6.1). */
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

export async function deleteTransaction(id: number): Promise<{ message: string }> {
  const { data } = await api.delete(`/transactions/${id}`)
  return data
}
