import { cn } from "@/lib/utils"
import { bdt, bdtSigned, usd, usdt } from "@/lib/format"

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
