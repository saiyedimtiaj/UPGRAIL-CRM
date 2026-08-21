"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import * as clientsApi from "@/services/clients.api"
import type { ClientListParams, CreateClientPayload } from "@/services/clients.api"
import { QK, invalidateFinancials } from "@/features/query-keys"

export const useClients = (params: ClientListParams = {}) =>
  useQuery({
    queryKey: [QK.clients, "list", params],
    queryFn: () => clientsApi.getClients(params),
    placeholderData: keepPreviousData,
  })

export const useActiveClients = () =>
  useQuery({
    queryKey: [QK.clients, "active"],
    queryFn: clientsApi.getActiveClients,
  })

export const useClient = (id: number | null) =>
  useQuery({
    queryKey: [QK.clients, "detail", id],
    queryFn: () => clientsApi.getClient(id as number),
    enabled: id !== null,
  })

function useInvalidateClients() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: [QK.clients] })
}

export const useCreateClient = () => {
  const invalidate = useInvalidateClients()
  return useMutation({
    mutationFn: (payload: CreateClientPayload) => clientsApi.createClient(payload),
    onSuccess: invalidate,
  })
}

export const useUpdateClient = () => {
  const invalidate = useInvalidateClients()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number } & Partial<CreateClientPayload> & { active?: boolean }) =>
      clientsApi.updateClient(id, payload),
    onSuccess: async () => {
      await invalidate()
      // active flag affects trade-entry comboboxes and balances
      await invalidateFinancials(qc)
    },
  })
}

export const useDeleteClient = () => {
  const invalidate = useInvalidateClients()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => clientsApi.deleteClient(id),
    onSuccess: async () => {
      await invalidate()
      await invalidateFinancials(qc)
    },
  })
}
