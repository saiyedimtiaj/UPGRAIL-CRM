"use client"

import * as React from "react"

/** Loads canvas-confetti lazily (only on fire) so it never bloats the initial bundle. */
export function useConfetti() {
  const fire = React.useCallback(async () => {
    const confetti = (await import("canvas-confetti")).default
    confetti({
      particleCount: 90,
      spread: 70,
      startVelocity: 35,
      origin: { y: 0.7 },
      colors: ["#10b981", "#059669", "#d1fae5", "#34d399"],
    })
  }, [])

  return fire
}
