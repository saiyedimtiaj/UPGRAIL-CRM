"use client"

import { useQuery } from "@tanstack/react-query"
import * as analyticsApi from "@/services/analytics.api"
import type { TimeSeriesRange } from "@/lib/types"
import { QK } from "@/features/query-keys"

export const useMetrics = () =>
  useQuery({
    queryKey: [QK.metrics],
    queryFn: analyticsApi.getMetrics,
  })

export const useBalances = () =>
  useQuery({
    queryKey: [QK.balances],
    queryFn: analyticsApi.getBalances,
  })

export const useTimeSeries = (range: TimeSeriesRange) =>
  useQuery({
    queryKey: [QK.metrics, "timeseries", range],
    queryFn: () => analyticsApi.getTimeSeries(range),
  })

export const useSellerPerformance = () =>
  useQuery({
    queryKey: [QK.metrics, "seller-performance"],
    queryFn: analyticsApi.getSellerPerformance,
  })

export const useClientsOverdue = () =>
  useQuery({
    queryKey: [QK.metrics, "clients-overdue"],
    queryFn: analyticsApi.getClientsOverdue,
  })
