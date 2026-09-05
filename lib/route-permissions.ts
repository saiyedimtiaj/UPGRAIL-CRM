/**
 * Which permission each admin route needs to be visible.
 *
 * One map drives three things: sidebar filtering, the page guard, and the
 * Settings landing cards. Keeping them from one source is what stops a page
 * being hidden from the nav but still reachable by typing its URL.
 */
export const ROUTE_PERMISSIONS: Record<string, string> = {
  "/admin": "dashboard.view",
  "/admin/trades": "trades.view",
  "/admin/transactions": "transactions.view",
  "/admin/rates": "rates.view",
  "/admin/rate-history": "rates.view",
  "/admin/clients": "clients.view",
  "/admin/sellers": "sellers.view",
  "/admin/primary-supplier": "sellers.view",
  "/admin/client-ledger": "client_ledger.view",
  "/admin/client-statements": "client_statements.view",
  "/admin/seller-ledger": "seller_ledger.view",
  "/admin/payments": "payments.view",
  "/admin/settlements": "settlements.view",
  "/admin/profit": "profit.view",
  "/admin/transfers": "transfers.view",
  "/admin/reports": "reports.view",
  "/admin/audit": "audit.view",
  "/admin/settings": "settings.view",
  "/admin/settings/team": "settings.team",
  "/admin/settings/permissions": "settings.roles",
  "/admin/settings/business": "settings.business",
  "/admin/settings/telegram": "settings.telegram",
  "/admin/settings/system": "settings.system",
  // Every signed-in user manages their own account.
  "/admin/settings/account": "",
}

/**
 * The permission a path needs, walking up to the parent for detail routes so
 * `/admin/clients/12` inherits `/admin/clients`.
 */
export function permissionForPath(pathname: string): string | undefined {
  const exact = ROUTE_PERMISSIONS[pathname]
  if (exact !== undefined) return exact || undefined

  const lastSlash = pathname.lastIndexOf("/")
  if (lastSlash > 0) {
    const parent = ROUTE_PERMISSIONS[pathname.slice(0, lastSlash)]
    if (parent !== undefined) return parent || undefined
  }

  return undefined
}
