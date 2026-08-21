"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import * as transactionsApi from "@/services/transactions.api"
import type {
  CreateTransactionPayload,
  TransactionListParams,
} from "@/services/transactions.api"
import { QK, invalidateFinancials } from "@/features/query-keys"

export const useTransactions = (params: TransactionListParams = {}) =>
  useQuery({
    queryKey: [QK.transactions, "list", params],
    queryFn: () => transactionsApi.getTransactions(params),
    placeholderData: keepPreviousData,
  })

export const useTransaction = (id: number | null) =>
  useQuery({
    queryKey: [QK.transactions, "detail", id],
    queryFn: () => transactionsApi.getTransaction(id as number),
    enabled: id !== null,
  })

export const useCreateTransaction = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTransactionPayload) => transactionsApi.createTransaction(payload),
    onSuccess: () => invalidateFinancials(qc),
  })
}

export const useUpdateTransaction = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number; usdAmount?: number; notes?: string }) =>
      transactionsApi.updateTransaction(id, payload),
    onSuccess: () => invalidateFinancials(qc),
  })
}

export const useVoidTransaction = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      transactionsApi.voidTransaction(id, reason),
    onSuccess: () => invalidateFinancials(qc),
  })
}

export const useDeleteTransaction = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => transactionsApi.deleteTransaction(id),
    onSuccess: () => invalidateFinancials(qc),
  })
}
