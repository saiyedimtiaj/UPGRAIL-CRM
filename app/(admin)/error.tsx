"use client"

import * as React from "react"
import { AlertTriangle, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"

/**
 * Catches render-time exceptions inside the admin shell.
 *
 * Without this, a single throw in any page unmounted the entire UI to a blank
 * screen with no way back — unacceptable for a tool people use to move money.
 * The sidebar and topbar live in the layout above, so they survive and the
 * user can navigate elsewhere.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    // Replace with your error reporter (Sentry et al) when one is wired up.
    console.error("Admin route error:", error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center p-6">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            This page didn&apos;t load
          </h2>
          <p className="text-sm text-slate-600">
            Something went wrong while rendering. Your data has not been
            changed. Try again, and if it keeps happening, note what you were
            doing and contact support.
          </p>
          {error.digest ? (
            <p className="pt-1 font-mono text-xs text-slate-400">
              Reference: {error.digest}
            </p>
          ) : null}
        </div>
        <Button onClick={reset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Try again
        </Button>
      </div>
    </div>
  )
}
