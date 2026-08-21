"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import * as settingsApi from "@/services/settings.api"
import { QK } from "@/features/query-keys"

/** Write is owner-only, enforced server-side. */
export const useSettings = () =>
  useQuery({
    queryKey: [QK.settings],
    queryFn: settingsApi.getSettings,
    staleTime: 60 * 1000,
  })

export const useUpdateSettings = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: settingsApi.updateSettings,
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK.settings] }),
  })
}
