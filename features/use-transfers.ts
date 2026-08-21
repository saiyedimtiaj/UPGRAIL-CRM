"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import * as transfersApi from "@/services/transfers.api"
import type { CreateTransferPayload, TransferListParams } from "@/services/transfers.api"
import type { MoneyDestination } from "@/lib/types"
import { QK, invalidateFinancials } from "@/features/query-keys"

export const useTransfers = (params: TransferListParams = {}) =>
  useQuery({
    queryKey: [QK.transfers, "list", params],
    queryFn: () => transfersApi.getTransfers(params),
    placeholderData: keepPreviousData,
  })

export const useTransferPreview = (
  from: MoneyDestination | undefined,
  to: MoneyDestination | undefined,
  amount: number | undefined,
) =>
  useQuery({
    queryKey: [QK.transfers, "preview", from, to, amount],
    queryFn: () => transfersApi.previewTransfer(from!, to!, amount!),
    enabled: !!from && !!to && from !== to && !!amount && amount > 0,
  })

export const useCreateTransfer = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTransferPayload) => transfersApi.createTransfer(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: [QK.transfers] })
      await invalidateFinancials(qc)
    },
  })
}

export const useVoidTransfer = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      transfersApi.voidTransfer(id, reason),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: [QK.transfers] })
      await invalidateFinancials(qc)
    },
  })
}
