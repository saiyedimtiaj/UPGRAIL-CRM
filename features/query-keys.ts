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
  notifications: "notifications",
} as const

/**
 * A rate write can retroactively finalize pending trades/settlements, so any
 * financial mutation invalidates this whole set instead of just its own
 * entity — hand-picking per mutation risks stale money left on screen.
 * Callers should still invalidate their own entity if it's not listed here.
 */
export function invalidateFinancials(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: [QK.metrics] }),
    queryClient.invalidateQueries({ queryKey: [QK.balances] }),
    queryClient.invalidateQueries({ queryKey: [QK.transactions] }),
    queryClient.invalidateQueries({ queryKey: [QK.settlements] }),
    queryClient.invalidateQueries({ queryKey: [QK.audit] }),
  ])
}
