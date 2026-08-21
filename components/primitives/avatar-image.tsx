"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { initials } from "@/lib/format"

interface AvatarImageProps {
  src: string | null
  name: string
  className?: string
}

/** Plain `<img>` (not next/image): avatar URLs are arbitrary/user-supplied,
 *  so next/image's `remotePatterns` allowlist isn't workable here. */
export function AvatarImage({ src, name, className }: AvatarImageProps) {
  const [failed, setFailed] = React.useState(false)

  // Empty string is not "no src" to the browser — it re-requests the current
  // page as an "image", so treat it the same as a failed load.
  if (failed || !src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-emerald-500/20 font-mono text-[10px] font-bold text-emerald-700",
          className
        )}
      >
        {initials(name)}
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- intentional, not next/image
    <img
      src={src}
      alt={name}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn("rounded-full object-cover", className)}
    />
  )
}
