import type { QueryClient } from "@tanstack/react-query"

export const QK = {
  clients: "clients",
  sellers: "sellers",
  rates: "rates",
  transactions: "transactions",
  settlements: "settlements",
  payments: "payments",
  transfers: "transfers",
  audit: "audit",
  users: "users",
  metrics: "metrics",
  balances: "balances",
  settings: "settings",
  statements: "statements",
  roles: "roles",
} as const

export function invalidateFinancials(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: [QK.metrics] }),
    queryClient.invalidateQueries({ queryKey: [QK.balances] }),
    queryClient.invalidateQueries({ queryKey: [QK.transactions] }),
    queryClient.invalidateQueries({ queryKey: [QK.settlements] }),
    queryClient.invalidateQueries({ queryKey: [QK.audit] }),
  ])
}
