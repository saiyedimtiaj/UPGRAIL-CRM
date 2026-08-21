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

/** Spec §7.4, §16.2: FIFO preview before confirming a settlement. */
export async function previewAllocation(
  sellerId: number,
  usdtAmount: number,
): Promise<AllocationProposalRow[]> {
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
  /** Owner/Partner override of the FIFO proposal (spec §7.4). Omit to
   *  accept the FIFO proposal as-is. */
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
