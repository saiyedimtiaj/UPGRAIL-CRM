"use client"

import * as React from "react"

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error("Auth route error:", error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-sm space-y-3 text-center">
        <h2 className="text-lg font-bold text-slate-900">
          Sign-in is temporarily unavailable
        </h2>
        <p className="text-sm text-slate-600">
          We couldn&apos;t load the sign-in page. Please try again.
        </p>
        <button
          onClick={reset}
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
