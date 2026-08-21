import { cn } from "@/lib/utils"

const TONE_CLASSES: Record<"emerald" | "rose" | "mint", string[]> = {
  emerald: [
    "bg-emerald-300",
    "bg-emerald-400",
    "bg-emerald-500",
    "bg-emerald-600",
  ],
  rose: ["bg-rose-300", "bg-rose-400", "bg-rose-500", "bg-rose-600"],
  mint: [
    "bg-emerald-600/30",
    "bg-emerald-600/50",
    "bg-emerald-600/70",
    "bg-emerald-700",
  ],
}

export function SparkBars({
  tone = "emerald",
  heights = [40, 65, 100, 55],
  className,
}: {
  tone?: "emerald" | "rose" | "mint"
  heights?: number[]
  className?: string
}) {
  const colors = TONE_CLASSES[tone]
  return (
    <div className={cn("flex h-9 items-end gap-1 px-1", className)}>
      {heights.map((h, i) => (
        <div
          key={i}
          className={cn("w-1.5 rounded-full", colors[i % colors.length])}
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  )
}
