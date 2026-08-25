"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import * as paymentsApi from "@/services/payments.api"
import type { CreatePaymentPayload, PaymentListParams } from "@/services/payments.api"
import { QK, invalidateFinancials } from "@/features/query-keys"
import type { MoneyDestination } from "@/lib/types"

export const usePayments = (params: PaymentListParams = {}) =>
  useQuery({
    queryKey: [QK.payments, "list", params],
    queryFn: () => paymentsApi.getPayments(params),
    placeholderData: keepPreviousData,
  })

function useInvalidatePayments() {
  const qc = useQueryClient()
  return async () => {
    await qc.invalidateQueries({ queryKey: [QK.payments] })
    await invalidateFinancials(qc)
  }
}

export const useCreatePayment = () => {
  const invalidate = useInvalidatePayments()
  return useMutation({
    mutationFn: (payload: CreatePaymentPayload) => paymentsApi.createPayment(payload),
    onSuccess: invalidate,
  })
}

export const useUpdatePayment = () => {
  const invalidate = useInvalidatePayments()
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: {
      id: number
      amount?: number
      destination?: MoneyDestination
      note?: string
      method?: string
    }) => paymentsApi.updatePayment(id, payload),
    onSuccess: invalidate,
  })
}

export const useDeletePayment = () => {
  const invalidate = useInvalidatePayments()
  return useMutation({
    mutationFn: (id: number) => paymentsApi.deletePayment(id),
    onSuccess: invalidate,
  })
}
