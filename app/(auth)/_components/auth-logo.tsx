import Image from "next/image"

import { cn } from "@/lib/utils"

/**
 * The product logo lockup.
 *
 * The source asset is a 1400x360 canvas whose right side is empty, so it is
 * cropped to the circular mark and rendered at a fixed square size rather
 * than scaled by width — otherwise the empty half forces a huge element with
 * the mark floating at one end.
 */
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
        // The mark occupies roughly the left quarter of the canvas; widen the
        // image to that ratio and pin it left so only the mark is visible.
        width={size * (1400 / 360)}
        height={size}
        priority={priority}
        className="absolute top-0 left-0 max-w-none"
        style={{ width: size * (1400 / 360), height: size }}
      />
    </span>
  )
}
