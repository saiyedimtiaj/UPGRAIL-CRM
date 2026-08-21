import { Skeleton } from "@/components/ui/skeleton"

export function AdminSkeleton() {
  return (
    <div className="flex min-h-screen w-full bg-brand-canvas">
      <div className="hidden w-64 shrink-0 bg-brand-ink lg:block" />
      <div className="w-full flex-1 space-y-6 p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-panel" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-card" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 rounded-card lg:col-span-2" />
          <Skeleton className="h-64 rounded-card" />
        </div>
      </div>
    </div>
  )
}
