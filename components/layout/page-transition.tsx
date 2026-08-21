"use client"

import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"
import { pageVariants } from "@/lib/animations"

// mode="wait" prevents the outgoing/incoming pages overlapping, which would
// otherwise double the scroll height mid-transition.
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={pageVariants}
        initial="hidden"
        animate="show"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
