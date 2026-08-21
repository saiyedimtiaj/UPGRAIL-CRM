"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import * as settlementsApi from "@/services/settlements.api"
import type {
  CreateSettlementPayload,
  SettlementListParams,
} from "@/services/settlements.api"
import { QK, invalidateFinancials } from "@/features/query-keys"

export const useSettlements = (params: SettlementListParams = {}) =>
  useQuery({
    queryKey: [QK.settlements, "list", params],
    queryFn: () => settlementsApi.getSettlements(params),
    placeholderData: keepPreviousData,
  })

export const useSettlement = (id: number | null) =>
  useQuery({
    queryKey: [QK.settlements, "detail", id],
    queryFn: () => settlementsApi.getSettlement(id as number),
    enabled: id !== null,
  })

export const usePreviewAllocation = (
  sellerId: number | undefined,
  usdtAmount: number | undefined,
) =>
  useQuery({
    queryKey: [QK.settlements, "preview-allocation", sellerId, usdtAmount],
    queryFn: () => settlementsApi.previewAllocation(sellerId!, usdtAmount!),
    enabled: sellerId !== undefined && !!usdtAmount && usdtAmount > 0,
  })

export const useCreateSettlement = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateSettlementPayload) => settlementsApi.createSettlement(payload),
    onSuccess: () => invalidateFinancials(qc),
  })
}

export const useUpdateSettlement = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number; note?: string }) =>
      settlementsApi.updateSettlement(id, payload),
    onSuccess: () => invalidateFinancials(qc),
  })
}

export const useVoidSettlement = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      settlementsApi.voidSettlement(id, reason),
    onSuccess: () => invalidateFinancials(qc),
  })
}
