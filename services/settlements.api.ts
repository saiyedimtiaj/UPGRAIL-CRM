import { api } from "@/lib/axios"
import type { PaginatedResponse, USDTSettlement } from "@/lib/types"

export interface SettlementListParams {
  page?: number
  limit?: number
  sellerId?: number
}

export async function getSettlements(
  params: SettlementListParams = {},
): Promise<PaginatedResponse<USDTSettlement>> {
  const { data } = await api.get("/settlements", { params })
  return data
}

export async function getSettlement(id: number): Promise<USDTSettlement> {
  const { data } = await api.get(`/settlements/${id}`)
  return data
}

export interface AllocationProposalRow {
  transaction_id: number
  allocated_usdt: number
}

export interface AllocationPreview {
  allocations: AllocationProposalRow[]
  requested_usdt: number
  allocated_usdt: number
  /** Amount no open trade could absorb; > 0 means the settlement overshoots. */
  unallocated_usdt: number
  /** Largest settlement this seller can absorb right now. */
  max_settleable_usdt: number
  exceeds_outstanding: boolean
}

export async function previewAllocation(
  sellerId: number,
  usdtAmount: number,
): Promise<AllocationPreview> {
  const { data } = await api.get("/settlements/preview-allocation", {
    params: { sellerId, usdtAmount },
  })
  return data
}

export interface AllocationOverride {
  transactionId: number
  allocatedUsdt: number
}

export interface CreateSettlementPayload {
  date: string
  sellerId: number
  usdtAmount: number
  paidBy?: number
  note?: string

  allocations?: AllocationOverride[]
}

export async function createSettlement(payload: CreateSettlementPayload): Promise<USDTSettlement> {
  const { data } = await api.post("/settlements", payload)
  return data
}

export async function updateSettlement(
  id: number,
  payload: { note?: string },
): Promise<USDTSettlement> {
  const { data } = await api.patch(`/settlements/${id}`, payload)
  return data
}

export async function voidSettlement(id: number, reason: string): Promise<{ message: string; reversedAllocations: number }> {
  const { data } = await api.patch(`/settlements/${id}/void`, { reason })
  return data
}

export interface ObligationTransferLine {
  id: number
  transfer_id: number
  obligation_id: number
  usdt_amount: number
}

export interface ObligationTransfer {
  id: number
  date: string
  from_seller_id: number
  from_seller_name: string
  to_seller_id: number
  to_seller_name: string
  usdt_amount: number
  entered_by: number
  note?: string
  voided: boolean
  created_at: string
  lines?: ObligationTransferLine[]
}

export interface TransferPreviewRow {
  obligation_id: number
  transaction_id: number | null
  usdt_amount: number
}

export interface TransferPreview {
  moves: TransferPreviewRow[]
  requested_usdt: number
  moved_usdt: number
  /** Above zero means the payee is not owed that much. */
  unmoved_usdt: number
  max_transferable_usdt: number
}

export async function previewTransfer(
  fromSellerId: number,
  usdtAmount: number,
): Promise<TransferPreview> {
  const { data } = await api.get("/settlements/preview-transfer", {
    params: { fromSellerId, usdtAmount },
  })
  return data
}

export interface CreateTransferPayload {
  date: string
  fromSellerId: number
  toSellerId: number
  usdtAmount: number
  note?: string
}

export async function createTransfer(
  payload: CreateTransferPayload,
): Promise<ObligationTransfer> {
  const { data } = await api.post("/settlements/transfer", payload)
  return data
}

export async function getTransfers(
  params: SettlementListParams = {},
): Promise<PaginatedResponse<ObligationTransfer>> {
  const { data } = await api.get("/settlements/transfers", { params })
  return data
}

export async function voidTransfer(
  id: number,
  reason: string,
): Promise<ObligationTransfer> {
  const { data } = await api.patch(`/settlements/transfers/${id}/void`, {
    reason,
  })
  return data
}
