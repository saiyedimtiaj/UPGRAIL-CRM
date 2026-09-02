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
