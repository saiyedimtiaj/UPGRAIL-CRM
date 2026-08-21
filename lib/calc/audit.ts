import type { AuditAction } from "@/lib/types"

/** Badge metadata only — entries are written server-side. */
export const AUDIT_ACTION_META: Record<
  AuditAction,
  { label: string; className: string }
> = {
  CREATE: {
    label: "CREATE",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  RATE_UPDATE: {
    label: "RATE UPDATE",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  VOID: {
    label: "VOID (SOFT DELETE)",
    className: "bg-rose-50 text-rose-700 border-rose-200",
  },
  SETTLEMENT: {
    label: "USDT SETTLEMENT",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  SETTLEMENT_ALLOCATION: {
    label: "SETTLEMENT ALLOCATION",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  PAYMENT: {
    label: "PAYMENT",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  TRANSFER: {
    label: "TRANSFER",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  EDIT: {
    label: "EDIT",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
  DELETE: {
    label: "DELETE",
    className: "bg-rose-50 text-rose-700 border-rose-200",
  },
}
