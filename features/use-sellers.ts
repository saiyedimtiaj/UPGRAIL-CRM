"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import * as sellersApi from "@/services/sellers.api"
import type { CreateSellerPayload, SellerListParams } from "@/services/sellers.api"
import { QK, invalidateFinancials } from "@/features/query-keys"

export const useSellers = (params: SellerListParams = {}) =>
  useQuery({
    queryKey: [QK.sellers, "list", params],
    queryFn: () => sellersApi.getSellers(params),
    placeholderData: keepPreviousData,
  })

export const useActiveSellers = () =>
  useQuery({
    queryKey: [QK.sellers, "active"],
    queryFn: sellersApi.getActiveSellers,
  })

export const useSeller = (id: number | null) =>
  useQuery({
    queryKey: [QK.sellers, "detail", id],
    queryFn: () => sellersApi.getSeller(id as number),
    enabled: id !== null,
  })

function useInvalidateSellers() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: [QK.sellers] })
}

export const useCreateSeller = () => {
  const invalidate = useInvalidateSellers()
  return useMutation({
    mutationFn: (payload: CreateSellerPayload) => sellersApi.createSeller(payload),
    onSuccess: invalidate,
  })
}

export const useUpdateSeller = () => {
  const invalidate = useInvalidateSellers()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number } & Partial<CreateSellerPayload> & { active?: boolean }) =>
      sellersApi.updateSeller(id, payload),
    onSuccess: async () => {
      await invalidate()
      await invalidateFinancials(qc)
    },
  })
}

export const useSetSettlementConduit = () => {
  const invalidate = useInvalidateSellers()
  return useMutation({
    mutationFn: (id: number) => sellersApi.setSettlementConduit(id),
    onSuccess: invalidate,
  })
}

export const useDeleteSeller = () => {
  const invalidate = useInvalidateSellers()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => sellersApi.deleteSeller(id),
    onSuccess: async () => {
      await invalidate()
      await invalidateFinancials(qc)
    },
  })
}
