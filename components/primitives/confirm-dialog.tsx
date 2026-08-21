"use client"

import * as React from "react"

import { Modal } from "@/components/primitives/modal"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  /** When true, the confirm button stays disabled until a reason is typed. */
  requireReason?: boolean
  reasonLabel?: string
  destructive?: boolean
  confirmLabel?: string
  onConfirm: (reason?: string) => void
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  requireReason = false,
  reasonLabel = "Reason",
  destructive = false,
  confirmLabel = "Confirm",
  onConfirm,
}: ConfirmDialogProps) {
  const [reason, setReason] = React.useState("")

  const canConfirm = !requireReason || reason.trim().length > 0

  // All close paths route through here so the draft reason can't leak into the next open.
  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) setReason("")
  }

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title={title}
      description={description}
      footer={
        <>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            disabled={!canConfirm}
            className="w-full sm:w-auto"
            onClick={() => {
              onConfirm(requireReason ? reason.trim() : undefined)
              handleOpenChange(false)
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {requireReason && (
        <div className="space-y-1.5">
          <Label htmlFor="confirm-reason">{reasonLabel}</Label>
          <Textarea
            id="confirm-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why this action is being taken..."
            rows={3}
          />
        </div>
      )}
    </Modal>
  )
}
