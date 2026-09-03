import { api } from "@/lib/axios"
import type {
  Balances,
  Metrics,
  SellerPerformanceRow,
  TimeSeriesRange,
  TimeSeriesResponse,
} from "@/lib/types"

export async function getMetrics(): Promise<Metrics> {
  const { data } = await api.get("/metrics")
  return data
}

export async function getBalances(): Promise<Balances> {
  const { data } = await api.get("/balances")
  return data
}

export async function getTimeSeries(
  range: TimeSeriesRange,
): Promise<TimeSeriesResponse> {
  const { data } = await api.get("/metrics/timeseries", { params: { range } })
  return data
}

export async function getSellerPerformance(): Promise<SellerPerformanceRow[]> {
  const { data } = await api.get("/metrics/seller-performance")
  return data
}

export interface ClientOverdueRow {
  client_id: number
  name: string
  company: string
  active: boolean
  total_due: number
  overdue: number
  current: number
  overdue_count: number
  total_paid: number
  last_transaction_at: string | null
}

export interface ClientsOverdueResponse {
  clients: ClientOverdueRow[]
  totals: {
    total_clients: number
    total_due: number
    total_overdue: number
    total_paid: number
  }
}

export async function getClientsOverdue(): Promise<ClientsOverdueResponse> {
  const { data } = await api.get("/metrics/clients-overdue")
  return data
}
