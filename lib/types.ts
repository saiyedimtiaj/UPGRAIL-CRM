

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

export interface Transaction {
  id: number
  created_at: string
  date: string
  entered_by: number
  entered_by_name: string
  client_id: number
  seller_id: number
  usd_amount: number

  card_rate: number

  seller_usdt_entitlement: number

  conduit_usdt_rate?: number

  client_rate?: number
  sell_bdt?: number
  client_charge_status: ClientChargeStatus

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

  destination: MoneyDestination
  note?: string
  method?: string
  voided: boolean
  created_at: string
}

export interface MoneyTransfer {
  id: number
  from_destination: MoneyDestination
  to_destination: MoneyDestination
  amount_bdt: number
  entered_by: number
  reference?: string
  note?: string

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

export interface Metrics {
  totalClientDue: number
  nazmulDue: number
  upgrailReserve: number
  totalSellerUsdtDue: number

  totalEarnedProfit: number
  profitTakenOut: number
  profitRemaining: number

  profitPendingCount: number
  profitPendingClientSalesValue: number
}

export interface Balances {
  clientDues: Record<number, number>
  /** Negative means the seller holds our credit (an advance). */
  sellerUsdtDues: Record<number, number>
  /** USDT of other sellers' obligations each seller has taken on. */
  sellerObligationsHeld: Record<number, number>
  /** USDT paid ahead of what a seller's trades could absorb. */
  sellerAdvances: Record<number, number>
  nazmulDue: number
  upgrailReserve: number
}

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
