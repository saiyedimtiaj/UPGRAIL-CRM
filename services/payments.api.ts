import { api } from "@/lib/axios"
import type {
  MoneyDestination,
  Payment,
  PaginatedResponse,
  PaymentDirection,
  PaymentPartyType,
} from "@/lib/types"

export interface PaymentListParams {
  page?: number
  limit?: number
  partyType?: PaymentPartyType
  partyId?: number
  direction?: PaymentDirection
  dateFrom?: string
  dateTo?: string
  search?: string
}

export async function getPayments(params: PaymentListParams = {}): Promise<PaginatedResponse<Payment>> {
  const { data } = await api.get("/payments", { params })
  return data
}

/** "Paid To" is required — spec §8.2. */
export interface CreatePaymentPayload {
  date: string
  partyType: PaymentPartyType
  partyId: number
  amount: number
  direction: PaymentDirection
  destination: MoneyDestination
  note?: string
  method?: string
}

export async function createPayment(payload: CreatePaymentPayload): Promise<Payment> {
  const { data } = await api.post("/payments", payload)
  return data
}

export async function updatePayment(
  id: number,
  payload: { amount?: number; note?: string; method?: string },
): Promise<Payment> {
  const { data } = await api.patch(`/payments/${id}`, payload)
  return data
}

export async function deletePayment(id: number): Promise<{ message: string }> {
  const { data } = await api.delete(`/payments/${id}`)
  return data
}
