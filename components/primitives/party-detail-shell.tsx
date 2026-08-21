"use client"

import Link from "next/link"
import { isAxiosError } from "axios"
import { AlertTriangle, SearchX } from "lucide-react"

import { cn } from "@/lib/utils"
import { getErrorMessage } from "@/lib/handleError"
import { EmptyState } from "@/components/primitives/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { Button, buttonVariants } from "@/components/ui/button"

export function isNotFoundError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 404
}

export function PartyDetailShell({
  isPending,
  isError,
  error,
  notFound,
  backHref,
  backLabel,
  entityLabel,
  onRetry,
  children,
}: {
  isPending: boolean
  isError: boolean
  error: unknown
  notFound: boolean
  backHref: string
  backLabel: string
  entityLabel: string
  onRetry?: () => void
  children: React.ReactNode
}) {
  if (isPending) {
    return (
      <div className="space-y-5 sm:space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3.5 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Skeleton className="h-32 rounded-card" />
          <Skeleton className="h-32 rounded-card" />
          <Skeleton className="h-32 rounded-card" />
        </div>
        <Skeleton className="h-56 rounded-card" />
        <Skeleton className="h-56 rounded-card" />
      </div>
    )
  }

  if (notFound) {
    return (
      <EmptyState
        icon={SearchX}
        title={`${entityLabel} not found`}
        description="It may have been removed, or the link is out of date."
        action={
          <Link href={backHref} className={cn(buttonVariants({ variant: "outline" }))}>
            {backLabel}
          </Link>
        }
      />
    )
  }

  if (isError) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title={`Couldn't load this ${entityLabel.toLowerCase()}`}
        description={getErrorMessage(error)}
        action={
          <div className="flex items-center gap-2">
            {onRetry && (
              <Button variant="outline" onClick={onRetry}>
                Retry
              </Button>
            )}
            <Link href={backHref} className={cn(buttonVariants({ variant: "outline" }))}>
              {backLabel}
            </Link>
          </div>
        }
      />
    )
  }

  return <>{children}</>
}
