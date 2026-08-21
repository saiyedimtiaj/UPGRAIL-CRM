"use client"

import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"
import { pageVariants } from "@/lib/animations"

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
