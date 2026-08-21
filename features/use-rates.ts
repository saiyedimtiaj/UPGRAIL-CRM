"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import * as ratesApi from "@/services/rates.api"
import type { RateHistoryParams, RateListParams, UpsertRatePayload } from "@/services/rates.api"
import { QK, invalidateFinancials } from "@/features/query-keys"

export const useRates = (params: RateListParams = {}) =>
  useQuery({
    queryKey: [QK.rates, "list", params],
    queryFn: () => ratesApi.getRates(params),
  })

export const useRateHistory = (params: RateHistoryParams = {}) =>
  useQuery({
    queryKey: [QK.rates, "history", params],
    queryFn: () => ratesApi.getRateHistory(params),
    placeholderData: keepPreviousData,
  })

/** Spec: a same-day rate correction can silently rewrite an already-
 *  POSTED/FINALIZED number — this lets the form warn before submit. */
export const useRateImpactPreview = (
  params: Parameters<typeof ratesApi.previewRateImpact>[0] | undefined
) =>
  useQuery({
    queryKey: [QK.rates, "preview-impact", params],
    queryFn: () => ratesApi.previewRateImpact(params!),
    enabled: !!params && !!params.value,
    placeholderData: keepPreviousData,
  })

/** Entering a rate can retroactively finalize pending trades/settlements, so it invalidates the full financial set, not just rates. */
export const useUpsertRate = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpsertRatePayload) => ratesApi.upsertRate(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: [QK.rates] })
      await invalidateFinancials(qc)
    },
  })
}

export const useDeleteRate = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => ratesApi.deleteRate(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: [QK.rates] })
      await invalidateFinancials(qc)
    },
  })
}
