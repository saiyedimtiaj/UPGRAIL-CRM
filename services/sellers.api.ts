import { api } from "@/lib/axios"
import type { PaginatedResponse, Seller, SellerRateType } from "@/lib/types"

export interface SellerListParams {
  page?: number
  limit?: number
  search?: string
  active?: boolean
  rateType?: SellerRateType
}

export async function getSellers(params: SellerListParams = {}): Promise<PaginatedResponse<Seller>> {
  const { data } = await api.get("/sellers", { params })
  return data
}

export async function getActiveSellers(): Promise<Seller[]> {
  const { data } = await api.get("/sellers/active")
  return data
}

export async function getSeller(id: number): Promise<Seller> {
  const { data } = await api.get(`/sellers/${id}`)
  return data
}

export interface CreateSellerPayload {
  name: string
  contact: string
  rateType: SellerRateType
  notes?: string
  region: string
  flag?: string
}

export async function createSeller(payload: CreateSellerPayload): Promise<Seller> {
  const { data } = await api.post("/sellers", payload)
  return data
}

export async function updateSeller(
  id: number,
  payload: Partial<CreateSellerPayload> & { active?: boolean },
): Promise<Seller> {
  const { data } = await api.patch(`/sellers/${id}`, payload)
  return data
}

export async function setSettlementConduit(id: number): Promise<Seller> {
  const { data } = await api.patch(`/sellers/${id}/settlement-conduit`)
  return data
}

export async function deleteSeller(id: number): Promise<{ message: string }> {
  const { data } = await api.delete(`/sellers/${id}`)
  return data
}
