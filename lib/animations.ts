import type { Transition, Variants } from "motion/react"

/** `MotionConfig reducedMotion="user"` is set once at the app root
 *  (components/providers.tsx), so variants here automatically respect
 *  `prefers-reduced-motion` with no extra code. */

export const EASE: Transition["ease"] = [0.22, 1, 0.36, 1]

export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: EASE } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.16, ease: EASE } },
}

export const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
}

export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: EASE } },
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
}

export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.12 } },
}

export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.22, ease: EASE },
  },
  exit: { opacity: 0, scale: 0.98, y: 4, transition: { duration: 0.14 } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.15, ease: EASE } },
}

export const NAV_INDICATOR_ID = "sidebar-nav-indicator"

export const countUpTransition: Transition = { duration: 0.8, ease: EASE }

/** Caps staggered rows — a 200-row table would otherwise take ~10s to animate in. */
export const MAX_STAGGER_ITEMS = 15
