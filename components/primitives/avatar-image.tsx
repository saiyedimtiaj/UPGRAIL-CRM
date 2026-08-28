"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { initials } from "@/lib/format"

interface AvatarImageProps {
  src: string | null
  name: string
  className?: string
}

export function AvatarImage({ src, name, className }: AvatarImageProps) {
  const [failed, setFailed] = React.useState(false)


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
    // Deliberately a plain <img>: avatars come from arbitrary external URLs,
    // which next/image would require an explicit remotePatterns allowlist for,
    // and at this size the optimiser would cost more than it saves.
    // eslint-disable-next-line @next/next/no-img-element
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
