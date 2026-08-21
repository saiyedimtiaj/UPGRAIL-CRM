/** Mirrors the backend's Prisma models and API response shapes exactly. */

export type UserRole = "OWNER" | "PARTNER" | "STAFF"

export interface User {
  id: number
  name: string
  email: string
  contact: string | null
  role: UserRole
  avatar: string | null
  tag: string | null
  active: boolean
  /** Owners/partners always see profit regardless of this flag. */
  canViewProfit?: boolean
  created_at: string
}

export type SellerRateType = "DIRECT" | "CARD"

export interface Seller {
  id: number
  name: string
  contact: string
  notes: string | null
  rate_type: SellerRateType
  active: boolean
  region: string
  flag: string | null
  /** Nazmul — the settlement conduit. At most one seller may carry this
   *  flag. Every non-conduit seller is an "external seller" per spec §7. */
  isSettlementConduit: boolean
  created_at: string
}

export interface Client {
  id: number
  name: string
  company: string
  contact: string
  notes: string | null
  active: boolean
  region: string
  created_at: string
}

export type RateKind = "DIRECT" | "CARD" | "USDT"
export type PartyType = "CLIENT" | "SELLER"

export interface DailyRate {
  id: number
  date: string
  party_type: PartyType
  party_id: number
  kind: RateKind
  value: number
  entered_by: number
  entered_at: string
}

export type ClientChargeStatus = "AWAITING_CLIENT_RATE" | "POSTED"
export type ProfitStatus =
  | "AWAITING_DAILY_RATE"
  | "PENDING_UNSETTLED"
  | "PENDING_PARTIAL"
  | "FINALIZED"
  | "VOIDED"

/** Spec §3, §6, §13: the client side (sellBdt/clientChargeStatus) and the
 *  seller/cost side (actualBuyBdt/profitStatus) price independently. An
 *  external-seller trade can show a POSTED client charge while its
 *  profitStatus is still PENDING_UNSETTLED — that's not a bug, it's the
 *  whole point of the settlement model. */
export interface Transaction {
  id: number
  created_at: string
  date: string
  entered_by: number
  entered_by_name: string
  client_id: number
  seller_id: number
  usd_amount: number

  /** Percentage, e.g. 92.5 means $100 costs 92.5 USDT. Staff-entered per
   *  transaction (spec §6.2) — not looked up from a rate sheet. */
  card_rate: number
  /** usd_amount * card_rate/100 — known immediately. */
  seller_usdt_entitlement: number
  /** Only meaningful for a Nazmul-supplied trade (spec §13.1). */
  conduit_usdt_rate?: number

  client_rate?: number
  sell_bdt?: number
  client_charge_status: ClientChargeStatus

  /** Cumulative USDT allocated to this transaction across all settlements. */
  settled_usdt: number
  actual_buy_bdt?: number
  effective_buy_rate?: number
  profit?: number
  profit_status: ProfitStatus
  finalized_at?: string

  voided: boolean
  void_reason?: string
  notes?: string

  client?: Client
  seller?: Seller
}

export interface SettlementAllocation {
  id: number
  settlement_id: number
  transaction_id: number
  allocated_usdt: number
  settlement_rate_snapshot: number
  allocated_bdt: number
  created_at: string
}

export interface USDTSettlement {
  id: number
  date: string
  seller_id: number
  usdt_amount: number
  paid_by: number
  paid_by_name: string
  entered_by: number
  /** Always known — a settlement cannot be created without the
   *  settlement-date USDT rate on file (spec §7.2, §16.2). */
  usdt_rate: number
  bdt_equivalent: number
  note?: string
  voided: boolean
  created_at: string
  seller?: Seller
  allocations?: SettlementAllocation[]
}

export type PaymentDirection = "IN" | "OUT"
export type PaymentPartyType = "CLIENT" | "DIRECT_SELLER"
export type MoneyDestination = "NAZMUL" | "UPGRAIL_BANK" | "PROFIT_BANK"

export interface Payment {
  id: number
  date: string
  entered_by: number
  party_type: PaymentPartyType
  party_id: number
  amount: number
  direction: PaymentDirection
  /** "Paid To" — spec §8.2, §9. Determines the second ledger effect. */
  destination: MoneyDestination
  note?: string
  method?: string
  voided: boolean
  created_at: string
}

/** Spec §10: a dedicated Owner/Partner action moving already-collected
 *  value between the three destinations — never a client payment. */
export interface MoneyTransfer {
  id: number
  from_destination: MoneyDestination
  to_destination: MoneyDestination
  amount_bdt: number
  entered_by: number
  reference?: string
  note?: string
  /** Required for a Profit Bank -> UpGrail reversal (spec §10.1). */
  reason?: string
  voided: boolean
  created_at: string
}

export interface TransferPreview {
  nazmul_due_change: number
  upgrail_reserve_change: number
  profit_remaining_change: number
  profit_taken_out_change: number
}

export type AuditAction =
  | "CREATE"
  | "EDIT"
  | "DELETE"
  | "VOID"
  | "RATE_UPDATE"
  | "SETTLEMENT"
  | "SETTLEMENT_ALLOCATION"
  | "PAYMENT"
  | "TRANSFER"

export type AuditEntityType =
  | "TRANSACTION"
  | "RATE"
  | "SETTLEMENT"
  | "SETTLEMENT_ALLOCATION"
  | "PAYMENT"
  | "TRANSFER"
  | "CLIENT"
  | "SELLER"
  | "USER"
  | "SETTINGS"

export interface AuditLogEntry {
  id: number
  timestamp: string
  user_id: number
  user_name: string
  action: AuditAction
  entity_type: AuditEntityType
  entity_id: string
  before_value?: string
  after_value?: string
  reason?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    totalCount: number
    totalPages: number
    currentPage: number
    limit: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export type NotificationType =
  | "TRADE_CREATED"
  | "TRADE_FINALIZED"
  | "TRADE_VOIDED"
  | "RATE_UPDATED"
  | "PAYMENT_RECORDED"
  | "SETTLEMENT_RECORDED"
  | "TRANSFER_RECORDED"

export interface AppNotification {
  id: number
  recipient_id: number
  type: NotificationType
  title: string
  body: string
  link?: string
  entity_type?: string
  entity_id?: string
  read_at: string | null
  created_at: string
}

/** GET /metrics — spec §18.1 dashboard headline numbers. */
export interface Metrics {
  totalClientDue: number
  nazmulDue: number
  upgrailReserve: number
  totalSellerUsdtDue: number
  /** Sum of profit from profit-finalized transactions ONLY (spec §13.3) —
   *  never mixes in an estimate for a still-pending external-seller trade. */
  totalEarnedProfit: number
  profitTakenOut: number
  profitRemaining: number
  /** Count of transactions still PENDING_UNSETTLED / PENDING_PARTIAL /
   *  AWAITING_DAILY_RATE — shown as a count + sales value, never folded
   *  into totalEarnedProfit. */
  profitPendingCount: number
  profitPendingClientSalesValue: number
}

/** GET /balances — spec §4, §11, §12: every due/reserve figure, ledger-
 *  derived, keyed by id where applicable. */
export interface Balances {
  clientDues: Record<number, number>
  sellerUsdtDues: Record<number, number>
  nazmulDue: number
  upgrailReserve: number
}

/** Owner-only to write; any authenticated user can read. */
export interface BusinessSettings {
  spreadMarginFallbackPercent: number
  defaultPaymentMethod: string
  paymentMethods: string[]
  defaultReportWindowDays: number
  dashboardTopSellersCount: number
  trendWindowDays: number
}

export type UpdateBusinessSettingsPayload = Partial<BusinessSettings>

export type TimeSeriesRange = "weekly" | "monthly" | "yearly"

export interface TimeSeriesPoint {
  /** YYYY-MM-DD for weekly/monthly, YYYY-MM for yearly. */
  key: string
  label: string
  volumeUSD: number
  profitBDT: number
  spreadPercent: number
  tradeCount: number
}

export interface TimeSeriesResponse {
  range: TimeSeriesRange
  points: TimeSeriesPoint[]
}

/** GET /metrics/seller-performance — realized volume/quota/trend per active
 *  seller, ranked and capped server-side by Business Rules settings. */
export interface SellerPerformanceRow {
  sellerId: number
  name: string
  region: string
  flag: string | null
  rateType: SellerRateType
  dealCount: number
  totalValueBdt: number
  quotaPercent: number
  trendDirection: "up" | "down"
}
