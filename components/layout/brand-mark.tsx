import { cn } from "@/lib/utils"

export function BrandMark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const box =
    size === "sm" ? "h-8 w-8" : size === "lg" ? "h-10 w-10" : "h-8 w-8"
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg border border-emerald-500/40 bg-emerald-500/15 shadow-lg shadow-emerald-950",
        box
      )}
    >
      <div className="flex items-center gap-[3px]">
        <div className="h-4 w-1.5 animate-pulse rounded-full bg-emerald-400" />
        <div className="h-5 w-1.5 rounded-full bg-emerald-300" />
        <div className="h-3 w-1.5 rounded-full bg-emerald-500" />
      </div>
    </div>
  )
}

export function BrandWordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex items-center gap-1.5 text-lg font-extrabold tracking-tight text-white",
        className
      )}
    >
      AdFund<span className="font-medium text-emerald-400">Global</span>
    </span>
  )
}
