"use client"

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import * as statementsApi from "@/services/statements.api"
import type { StatementListParams } from "@/services/statements.api"
import { QK } from "@/features/query-keys"

export const useStatements = (params: StatementListParams) =>
  useQuery({
    queryKey: [QK.statements, "list", params],
    queryFn: () => statementsApi.getStatements(params),
    placeholderData: keepPreviousData,
  })

export const useStatementPreview = (
  clientId: number | undefined,
  date: string,
) =>
  useQuery({
    queryKey: [QK.statements, "preview", clientId, date],
    queryFn: () => statementsApi.previewStatement(clientId!, date),
    enabled: clientId !== undefined,
  })

export const useTelegramStatus = () =>
  useQuery({
    queryKey: [QK.statements, "telegram-status"],
    queryFn: statementsApi.getTelegramStatus,
    staleTime: 60 * 1000,
  })

function useInvalidateStatements() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: [QK.statements] })
}

export const useSendStatement = () => {
  const invalidate = useInvalidateStatements()
  return useMutation({
    mutationFn: statementsApi.sendStatement,
    onSuccess: invalidate,
  })
}

export const useSendStatementsBulk = () => {
  const invalidate = useInvalidateStatements()
  return useMutation({
    mutationFn: statementsApi.sendStatementsBulk,
    onSuccess: invalidate,
  })
}

/**
 * Polls a bulk run while it is in flight.
 *
 * The interval stops itself once the run reports DONE, so a finished run does
 * not keep hitting the API.
 */
export const useBulkRun = (runId: string | null) =>
  useQuery({
    queryKey: [QK.statements, "run", runId],
    queryFn: () => statementsApi.getBulkRun(runId!),
    enabled: runId !== null,
    refetchInterval: (query) =>
      query.state.data?.status === "RUNNING" ? 1200 : false,
  })

export const useMarkStatementSent = () => {
  const invalidate = useInvalidateStatements()
  return useMutation({
    mutationFn: statementsApi.markStatementSent,
    onSuccess: invalidate,
  })
}

export const useIssueTelegramInvite = () => {
  const invalidate = useInvalidateStatements()
  return useMutation({
    mutationFn: statementsApi.issueTelegramInvite,
    onSuccess: invalidate,
  })
}

export const useRevokeTelegramLink = () => {
  const invalidate = useInvalidateStatements()
  return useMutation({
    mutationFn: statementsApi.revokeTelegramLink,
    onSuccess: invalidate,
  })
}

export const useConnectTelegramByChatId = () => {
  const invalidate = useInvalidateStatements()
  return useMutation({
    mutationFn: ({ clientId, chatId }: { clientId: number; chatId: string }) =>
      statementsApi.connectTelegramByChatId(clientId, chatId),
    onSuccess: invalidate,
  })
}
