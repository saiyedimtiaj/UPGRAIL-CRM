import { api } from "@/lib/axios"
import type {
  AuditAction,
  AuditEntityType,
  AuditLogEntry,
  PaginatedResponse,
} from "@/lib/types"

export interface AuditListParams {
  page?: number
  limit?: number
  search?: string
  action?: AuditAction
  entityType?: AuditEntityType
}

export async function getAuditLog(params: AuditListParams = {}): Promise<PaginatedResponse<AuditLogEntry>> {
  const { data } = await api.get("/audit", { params })
  return data
}
