/** Inline SVG up/down trend line used in table cells (e.g. the dashboard's
 *  regional sourcing table). Purely decorative — direction communicates
 *  "trending up" vs "trending down" for that row. */
export function SparkLine({
  trend,
  className,
}: {
  trend: "up" | "down"
  className?: string
}) {
  return (
    <svg
      className={className ?? "h-4 w-16 stroke-current"}
      viewBox="0 0 60 16"
      fill="none"
    >
      {trend === "up" ? (
        <path
          d="M0 12 Q 15 15, 30 6 T 60 2"
          stroke="#10b981"
          strokeWidth="1.8"
          fill="none"
        />
      ) : (
        <path
          d="M0 4 Q 15 2, 30 10 T 60 14"
          stroke="#f43f5e"
          strokeWidth="1.8"
          fill="none"
        />
      )}
    </svg>
  )
}
