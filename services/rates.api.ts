import { api } from "@/lib/axios"
import type { DailyRate, PaginatedResponse, PartyType, RateKind } from "@/lib/types"

export interface RateListParams {
  date?: string
  partyType?: PartyType
  partyId?: number
}

export async function getRates(params: RateListParams = {}): Promise<DailyRate[]> {
  const { data } = await api.get("/rates", { params })
  return data
}

export interface RateHistoryParams {
  page?: number
  limit?: number
  dateFrom?: string
  dateTo?: string
  partyType?: PartyType
  partyId?: number
  kind?: RateKind
}

export async function getRateHistory(
  params: RateHistoryParams = {}
): Promise<PaginatedResponse<DailyRate>> {
  const { data } = await api.get("/rates/history", { params })
  return data
}

export interface UpsertRatePayload {
  date: string
  partyType: PartyType
  partyId: number
  kind: RateKind
  value: number
  reason?: string
}

export interface UpsertRateResult {
  rate: DailyRate
  changedCount: number
}

export async function upsertRate(payload: UpsertRatePayload): Promise<UpsertRateResult> {
  const { data } = await api.post("/rates", payload)
  return data
}

export async function deleteRate(id: number): Promise<{ message: string; changedCount: number }> {
  const { data } = await api.delete(`/rates/${id}`)
  return data
}

export interface RateImpactPreview {
  alreadyPricedCount: number
  note: string | null
}

export async function previewRateImpact(params: {
  date: string
  partyType: PartyType
  partyId: number
  kind: RateKind
  value: number
}): Promise<RateImpactPreview> {
  const { data } = await api.get("/rates/preview-impact", { params })
  return data
}
