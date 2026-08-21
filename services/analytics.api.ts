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
