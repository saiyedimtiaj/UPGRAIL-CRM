"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import * as auditApi from "@/services/audit.api"
import type { AuditListParams } from "@/services/audit.api"
import { QK } from "@/features/query-keys"

export const useAuditLog = (params: AuditListParams = {}) =>
  useQuery({
    queryKey: [QK.audit, "list", params],
    queryFn: () => auditApi.getAuditLog(params),
    placeholderData: keepPreviousData,
  })
