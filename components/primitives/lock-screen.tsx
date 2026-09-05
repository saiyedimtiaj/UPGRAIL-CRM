"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { ArrowLeft, Lock, ShieldAlert } from "lucide-react"

import { staggerChild, staggerParent } from "@/lib/animations"
import { cn } from "@/lib/utils"

/**
 * Shown when a role may not see a page.
 *
 * Deliberately explains *why* and offers a way out rather than just refusing:
 * the person hitting this is usually a colleague who followed a link, not an
 * intruder, and a dead end with no explanation reads as a broken app.
 */
export function LockScreen({
  title,
  description,
  permission,
  className,
}: {
  title: string
  description: string
  /** The missing permission key, shown so an admin can grant exactly that. */
  permission?: string
  className?: string
}) {
  return (
    <motion.div
      variants={staggerParent}
      initial="hidden"
      animate="show"
      className={cn(
        "flex flex-1 items-center justify-center px-4 py-16 sm:py-24",
        className,
      )}
    >
      <div className="w-full max-w-md">
        <motion.div
          variants={staggerChild}
          className="relative overflow-hidden rounded-card border border-emerald-500/20 bg-brand-card p-8 text-center shadow-xl"
        >
          {/* Soft glow, matching the dark stat cards elsewhere in the app. */}
          <div className="pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/25">
              <Lock className="h-7 w-7 text-emerald-400" />
            </div>

            <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold tracking-widest text-emerald-400 uppercase ring-1 ring-emerald-500/20">
              <ShieldAlert className="h-3 w-3" />
              Restricted
            </span>

            <h2 className="mt-4 text-xl font-bold tracking-tight text-white">
              {title}
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-zinc-400">
              {description}
            </p>

            {permission && (
              <p className="mt-4 font-mono text-[11px] text-zinc-500">
                Needs{" "}
                <span className="rounded bg-white/5 px-1.5 py-0.5 text-emerald-400/80">
                  {permission}
                </span>
              </p>
            )}
          </div>
        </motion.div>

        <motion.div variants={staggerChild} className="mt-4 text-center">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )
}
