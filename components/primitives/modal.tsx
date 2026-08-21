"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { AnimatePresence, motion } from "motion/react"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { backdropVariants, modalVariants } from "@/lib/animations"
import { Button } from "@/components/ui/button"

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

/** Built on Base UI's Dialog; Motion is wired in via Base UI's `render` prop,
 *  the supported way to swap in a custom animated backdrop/popup element. */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: ModalProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal keepMounted>
            <DialogPrimitive.Backdrop
              render={
                <motion.div
                  variants={backdropVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                />
              }
            />
            <DialogPrimitive.Popup
              render={
                <motion.div
                  variants={modalVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className={cn(
                    "fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl focus:outline-none sm:p-6",
                    className
                  )}
                />
              }
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <DialogPrimitive.Title className="text-base font-extrabold tracking-tight text-slate-900">
                    {title}
                  </DialogPrimitive.Title>
                  {description && (
                    <DialogPrimitive.Description className="mt-1 text-xs text-slate-500">
                      {description}
                    </DialogPrimitive.Description>
                  )}
                </div>
                <DialogPrimitive.Close
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="shrink-0"
                    />
                  }
                >
                  <XIcon className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
              </div>

              {children}

              {footer && (
                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  {footer}
                </div>
              )}
            </DialogPrimitive.Popup>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  )
}
