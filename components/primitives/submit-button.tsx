"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"

type SubmitButtonProps = React.ComponentProps<typeof Button> & {
  isSubmitting?: boolean
  /** Shown in place of the children while the request is in flight. */
  pendingLabel?: string
}

/**
 * A Button that blocks re-submission and shows a spinner while a mutation is
 * in flight. Centralised so every form in the app behaves identically.
 */
export function SubmitButton({
  isSubmitting = false,
  pendingLabel,
  disabled,
  children,
  ...props
}: SubmitButtonProps) {
  return (
    <Button
      {...props}
      disabled={disabled || isSubmitting}
      aria-busy={isSubmitting}
    >
      {isSubmitting ? (
        <>
          <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
          {pendingLabel ?? children}
        </>
      ) : (
        children
      )}
    </Button>
  )
}
