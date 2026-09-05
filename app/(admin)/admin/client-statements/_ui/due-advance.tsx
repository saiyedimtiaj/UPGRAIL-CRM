import { cn } from "@/lib/utils"
import { bdt } from "@/lib/format"

/**
 * A balance with the word that makes its sign readable.
 *
 * Positive means the client owes us; negative means they have paid ahead. The
 * amount is always shown absolute — "Advance ৳-5,000" double-negates and reads
 * as a debt, which is the one thing this feature must never tell a client who
 * is actually in credit.
 */
export function DueAdvance({
  value,
  className,
  showWord = true,
}: {
  value: number
  className?: string
  showWord?: boolean
}) {
  const word = value > 0 ? "Due" : value < 0 ? "Advance" : null

  return (
    <span
      className={cn(
        "font-mono tabular-nums",
        value > 0 && "text-slate-900",
        value < 0 && "text-emerald-700",
        value === 0 && "text-slate-400",
        className,
      )}
    >
      {showWord && word ? (
        <span className="mr-1 font-sans text-[10px] font-bold tracking-wide uppercase opacity-70">
          {word}
        </span>
      ) : null}
      {bdt(Math.abs(value))}
    </span>
  )
}
