"use client"

import { useQuery } from "@tanstack/react-query"
import * as adminApi from "@/services/admin.api"

export const useAdminStats = () =>
  useQuery({
    queryKey: ["admin-stats"],
    queryFn: adminApi.getAdminStats,
  })
