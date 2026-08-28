import { Skeleton } from "@/components/ui/skeleton"

/**
 * Streamed immediately while a route segment's server work resolves, so
 * navigation paints structure rather than leaving the last page frozen.
 */
export default function AdminLoading() {
  return (
    <div className="w-full space-y-5 p-4 sm:space-y-6 sm:p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-80 w-full rounded-2xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  )
}
