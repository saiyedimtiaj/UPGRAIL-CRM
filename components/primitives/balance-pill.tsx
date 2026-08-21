import { cn } from "@/lib/utils"
import { bdt } from "@/lib/format"

export function BalancePill({
  balance,
  onDark = false,
  className,
}: {
  balance: number
  onDark?: boolean
  className?: string
}) {
  const isOwed = balance > 0
  const isAdvance = balance < 0
  const isSettled = balance === 0

  return (
    <div className={cn("text-right", className)}>
      <div
        className={cn(
          "font-mono text-sm font-black tracking-tight",
          isOwed && "text-rose-500",
          isAdvance && "text-emerald-400",
          isSettled && (onDark ? "text-zinc-500" : "text-slate-400")
        )}
      >
        {bdt(Math.abs(balance))}
      </div>
      <div
        className={cn(
          "text-[10px] font-semibold",
          onDark ? "text-zinc-500" : "text-slate-400"
        )}
      >
        {isOwed ? "Dues Owed" : isAdvance ? "Advance Paid" : "Settled"}
      </div>
    </div>
  )
}
