import Image from "next/image"

import { cn } from "@/lib/utils"

export function AuthLogo({
  size = 44,
  className,
  priority = false,
}: {
  size?: number
  className?: string
  priority?: boolean
}) {
  return (
    <span
      className={cn("relative block shrink-0 overflow-hidden", className)}
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo.webp"
        alt="AdFund Global"

        width={size * (1400 / 360)}
        height={size}
        priority={priority}
        className="absolute top-0 left-0 max-w-none"
        style={{ width: size * (1400 / 360), height: size }}
      />
    </span>
  )
}
