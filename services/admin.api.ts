import { api } from "@/lib/axios"

export interface AdminStats {
  clients: number
  sellers: number
  transactions: number
  settlements: number
  payments: number
  withdrawals: number
  auditLogs: number
  users: number
}

export async function getAdminStats(): Promise<AdminStats> {
  const { data } = await api.get("/admin/stats")
  return data
}
