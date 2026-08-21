import { api } from "@/lib/axios"
import type { MoneyDestination, MoneyTransfer, PaginatedResponse, TransferPreview } from "@/lib/types"

export interface TransferListParams {
  page?: number
  limit?: number
}

export async function getTransfers(
  params: TransferListParams = {},
): Promise<PaginatedResponse<MoneyTransfer>> {
  const { data } = await api.get("/transfers", { params })
  return data
}

export async function previewTransfer(
  from: MoneyDestination,
  to: MoneyDestination,
  amount: number,
): Promise<TransferPreview> {
  const { data } = await api.get("/transfers/preview", { params: { from, to, amount } })
  return data
}

export interface CreateTransferPayload {
  fromDestination: MoneyDestination
  toDestination: MoneyDestination
  amountBdt: number
  reference?: string
  note?: string

  reason?: string
}

export async function createTransfer(payload: CreateTransferPayload): Promise<MoneyTransfer> {
  const { data } = await api.post("/transfers", payload)
  return data
}

export async function voidTransfer(id: number, reason: string): Promise<MoneyTransfer> {
  const { data } = await api.patch(`/transfers/${id}/void`, { reason })
  return data
}
