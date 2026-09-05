import { cn } from "@/lib/utils"
import { bdt, bdtSigned, rate, usd, usdt } from "@/lib/format"

interface MoneyProps {
  value: number | undefined | null
  className?: string
}

export function Bdt({ value, className }: MoneyProps) {
  return (
    <span className={cn("font-mono tabular-nums", className)}>
      {bdt(value)}
    </span>
  )
}

export function BdtSigned({ value, className }: MoneyProps) {
  const n = value ?? 0
  return (
    <span
      className={cn(
        "font-mono tabular-nums",
        n > 0 && "text-emerald-600",
        n < 0 && "text-rose-600",
        className
      )}
    >
      {bdtSigned(n)}
    </span>
  )
}

export function Usd({ value, className }: MoneyProps) {
  return (
    <span className={cn("font-mono tabular-nums", className)}>
      {usd(value)}
    </span>
  )
}

export function Usdt({ value, className }: MoneyProps) {
  return (
    <span className={cn("font-mono tabular-nums", className)}>
      {usdt(value)}
    </span>
  )
}

/** An exchange rate (BDT/USD, BDT/USDT) — always shows 2 decimals, unlike Bdt which rounds to whole currency. */
export function Rate({ value, className }: MoneyProps) {
  return (
    <span className={cn("font-mono tabular-nums", className)}>
      {rate(value)}
    </span>
  )
}
