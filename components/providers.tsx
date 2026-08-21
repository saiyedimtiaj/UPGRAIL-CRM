"use client"

import * as React from "react"
import { MotionConfig } from "motion/react"

import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { QueryProvider } from "@/components/providers/query-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <MotionConfig reducedMotion="user">
          <TooltipProvider delay={150}>
            {children}
            <Toaster position="top-right" richColors closeButton />
          </TooltipProvider>
        </MotionConfig>
      </ThemeProvider>
    </QueryProvider>
  )
}
