"use client"

import * as React from "react"
import { motion } from "motion/react"
import { FileText, FolderOpen, LayoutGrid, Tag } from "lucide-react"

export interface EmptyStateProps {
  title: string
  description?: string
  /** Shown only when `variant="icon"`. */
  icon?: React.ReactNode
  action?: React.ReactNode
  size?: "sm" | "md" | "lg"
  /** "animation" = the orbiting-icon cluster below. "icon" = a plain muted
   *  icon box using the `icon` prop. */
  variant?: "animation" | "icon"
  className?: string
}

const clusterSizeMap: Record<NonNullable<EmptyStateProps["size"]>, number> = {
  sm: 128,
  md: 160,
  lg: 220,
}

const containerPaddingMap: Record<
  NonNullable<EmptyStateProps["size"]>,
  string
> = {
  sm: "py-6",
  md: "py-8",
  lg: "py-16",
}

const RING_RADIUS_PCT = [14, 28, 42, 56]

const ORBIT_ICONS = [FileText, Tag, LayoutGrid, FolderOpen]

function ringIconPositions(radiusPct: number, startDeg: number) {
  return [0, 90, 180, 270].map((offset) => {
    const rad = ((startDeg + offset) * Math.PI) / 180
    return {
      left: `${50 + radiusPct * Math.cos(rad)}%`,
      top: `${50 + radiusPct * Math.sin(rad)}%`,
    }
  })
}

function EmptyStateCluster({
  size,
}: {
  size: NonNullable<EmptyStateProps["size"]>
}) {
  const dim = clusterSizeMap[size]
  const ring2Pos = ringIconPositions(RING_RADIUS_PCT[1], 45)
  const ring4Pos = ringIconPositions(RING_RADIUS_PCT[3], 0)
  const chipSize = size === "sm" ? 20 : size === "md" ? 24 : 28
  const iconSize = size === "sm" ? 11 : size === "md" ? 13 : 15
  const centerSize = size === "sm" ? 22 : size === "md" ? 26 : 34

  return (
    <div className="relative shrink-0" style={{ width: dim, height: dim }}>
      {RING_RADIUS_PCT.map((pct, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-emerald-900/10"
          style={{
            left: `${50 - pct}%`,
            top: `${50 - pct}%`,
            width: `${pct * 2}%`,
            height: `${pct * 2}%`,
          }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: i * 0.06 }}
        />
      ))}

      {ring2Pos.map((pos, i) => {
        const Icon = ORBIT_ICONS[i]
        return (
          <motion.div
            key={`r2-${i}`}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-50 shadow-sm"
            style={{ ...pos, width: chipSize, height: chipSize }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1, y: [0, -5, 0] }}
            transition={{
              opacity: { duration: 0.35, delay: 0.15 + i * 0.08 },
              scale: {
                duration: 0.35,
                delay: 0.15 + i * 0.08,
                ease: "easeOut",
              },
              y: {
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.4,
              },
            }}
          >
            <Icon
              className="text-emerald-600"
              style={{ width: iconSize, height: iconSize }}
            />
          </motion.div>
        )
      })}

      {ring4Pos.map((pos, i) => {
        const Icon = ORBIT_ICONS[(i + 2) % ORBIT_ICONS.length]
        return (
          <motion.div
            key={`r4-${i}`}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border border-emerald-500/15 bg-emerald-50/70 shadow-sm"
            style={{ ...pos, width: chipSize, height: chipSize }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1, y: [0, -5, 0] }}
            transition={{
              opacity: { duration: 0.35, delay: 0.3 + i * 0.08 },
              scale: {
                duration: 0.35,
                delay: 0.3 + i * 0.08,
                ease: "easeOut",
              },
              y: {
                duration: 3.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5 + i * 0.4,
              },
            }}
          >
            <Icon
              className="text-emerald-500"
              style={{ width: iconSize, height: iconSize }}
            />
          </motion.div>
        )
      })}

      <motion.div
        className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center text-emerald-700"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
      >
        <FileText style={{ width: centerSize, height: centerSize }} strokeWidth={2} />
      </motion.div>
    </div>
  )
}

export default function EmptyState({
  title,
  description,
  icon,
  action,
  size = "md",
  variant = "animation",
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 px-6 text-center ${containerPaddingMap[size]} ${className}`}
    >
      {variant === "animation" ? (
        <EmptyStateCluster size={size} />
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground">
          {icon}
        </div>
      )}
      <div className="mt-6">
        <p className="text-lg font-bold text-foreground">{title}</p>
        {description && (
          <p className="mx-auto max-w-xs text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
