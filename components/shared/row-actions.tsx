"use client"

import * as React from "react"
import { MoreHorizontal, Pencil, Trash2, type LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
export interface RowAction {
  label: string
  icon?: LucideIcon
  onSelect: () => void
  /** Renders in rose/destructive styling and gets a separator above it. */
  destructive?: boolean
  disabled?: boolean
}

export function RowActions({
  onEdit,
  onDelete,
  deleteLabel = "Delete",
  editLabel = "Edit",
  extraActions,
  disabled,
}: {
  onEdit?: () => void
  onDelete?: () => void
  deleteLabel?: string
  editLabel?: string
  extraActions?: RowAction[]
  disabled?: boolean
}) {
  if (disabled || (!onEdit && !onDelete && !extraActions?.length)) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-slate-400 hover:text-slate-700"
            aria-label="Row actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-44">
        {onEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
            {editLabel}
          </DropdownMenuItem>
        )}
        {extraActions?.map((action) => (
          <React.Fragment key={action.label}>
            {action.destructive && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={action.onSelect}
              disabled={action.disabled}
              variant={action.destructive ? "destructive" : "default"}
            >
              {action.icon && <action.icon className="h-3.5 w-3.5" />}
              {action.label}
            </DropdownMenuItem>
          </React.Fragment>
        ))}
        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} variant="destructive">
              <Trash2 className="h-3.5 w-3.5" />
              {deleteLabel}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
