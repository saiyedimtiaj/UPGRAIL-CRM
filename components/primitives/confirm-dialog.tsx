"use client"

import * as React from "react"

import { Modal } from "@/components/primitives/modal"
import { Button } from "@/components/ui/button"
import { SubmitButton } from "@/components/primitives/submit-button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string

  requireReason?: boolean
  reasonLabel?: string
  destructive?: boolean
  confirmLabel?: string
  onConfirm: (reason?: string) => void
  /**
   * Keeps the dialog open and shows a spinner while the action runs. Omit it
   * for actions that resolve instantly — the dialog then closes on confirm as
   * before.
   */
  isConfirming?: boolean
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
  isConfirming = false,
}: ConfirmDialogProps) {
  const [reason, setReason] = React.useState("")

  const canConfirm = !requireReason || reason.trim().length > 0

  function handleOpenChange(next: boolean) {
    // Ignore dismissals while the action is in flight so the user cannot
    // close the dialog out from under a running request.
    if (isConfirming && !next) return
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
            disabled={isConfirming}
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <SubmitButton
            variant={destructive ? "destructive" : "default"}
            disabled={!canConfirm}
            isSubmitting={isConfirming}
            className="w-full sm:w-auto"
            onClick={() => {
              onConfirm(requireReason ? reason.trim() : undefined)
              if (!isConfirming) handleOpenChange(false)
            }}
          >
            {confirmLabel}
          </SubmitButton>
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
