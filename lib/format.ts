import { BDT_SYMBOL } from "@/lib/constants"

export function bdt(value: number | undefined | null): string {
  const n = value ?? 0
  return `${BDT_SYMBOL}${Math.round(n).toLocaleString("en-US")}`
}

export function bdtSigned(value: number | undefined | null): string {
  const n = value ?? 0
  const sign = n > 0 ? "+" : n < 0 ? "-" : ""
  return `${sign}${bdt(Math.abs(n))}`
}

export function usd(value: number | undefined | null): string {
  const n = value ?? 0
  return `$${Math.round(n).toLocaleString("en-US")}`
}

export function usdt(value: number | undefined | null): string {
  const n = value ?? 0
  return `${n.toLocaleString("en-US", { maximumFractionDigits: 2 })} USDT`
}

export function pct(value: number | undefined | null): string {
  const n = value ?? 0
  return `${n.toFixed(2)}%`
}

export function compactNum(value: number | undefined | null): string {
  const n = value ?? 0
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n)
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}
