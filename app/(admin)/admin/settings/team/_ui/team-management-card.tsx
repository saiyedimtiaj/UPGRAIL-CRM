"use client"

import * as React from "react"
import { toast } from "sonner"
import { Plus } from "lucide-react"

import { useMe } from "@/features/use-auth"
import { useDeleteUser, useUsers } from "@/features/use-users"
import type { TAdminUser } from "@/services/users.api"
import { getErrorMessage } from "@/lib/handleError"
import { SectionCard } from "@/components/primitives/section-card"
import { AvatarImage } from "@/components/primitives/avatar-image"
import { RowActions } from "@/components/shared/row-actions"
import { ConfirmDialog } from "@/components/primitives/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { EditUserModal } from "./edit-user-modal"


export function TeamManagementCard() {
  const { data: me } = useMe()
  const { data: usersPage, isPending } = useUsers({ limit: 100 })
  const deleteUser = useDeleteUser()

  const [addOpen, setAddOpen] = React.useState(false)
  const [editTarget, setEditTarget] = React.useState<TAdminUser | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<TAdminUser | null>(null)

  const isOwner = me?.role.name === "OWNER"
  const users = usersPage?.data ?? []
  const ownerCount = users.filter((u) => u.role.name === "OWNER").length

  async function confirmDelete() {
    if (!deleteTarget) return
    try {
      await deleteUser.mutateAsync(deleteTarget.id)
      toast.success(`${deleteTarget.name} removed.`)
      setDeleteTarget(null)
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not remove user"))
    }
  }

  return (
    <>
      <SectionCard
        title="Team Management"
        subtitle="Add, edit, or remove team member accounts"
        action={
          isOwner ? (
            <Button size="sm" onClick={() => setAddOpen(true)} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Add Member
            </Button>
          ) : undefined
        }
      >
        <div className="space-y-2">
          {isPending &&
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}

          {!isPending && users.length === 0 && (
            <p className="text-sm text-slate-400">No team members yet.</p>
          )}

          {users.map((user) => {
            const isLastOwner = user.role.name === "OWNER" && ownerCount <= 1
            return (
              <div
                key={user.id}
                className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3.5 py-3"
              >
                <AvatarImage
                  src={user.avatar ?? ""}
                  name={user.name}
                  className="h-9 w-9 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-slate-900">
                    {user.name}
                  </div>
                  <div className="truncate text-[11px] text-slate-500">
                    {user.email}
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-500 uppercase">
                  {user.role.label}
                </span>
                <RowActions
                  disabled={!isOwner}
                  onEdit={() => setEditTarget(user)}
                  onDelete={isLastOwner ? undefined : () => setDeleteTarget(user)}
                />
              </div>
            )
          })}
        </div>
      </SectionCard>

      <EditUserModal open={addOpen} onOpenChange={setAddOpen} mode="create" />

      <EditUserModal
        open={editTarget !== null}
        onOpenChange={(open) => !open && setEditTarget(null)}
        mode="edit"
        initial={editTarget ?? undefined}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remove Team Member"
        description={`Permanently remove ${deleteTarget?.name ?? "this user"}'s account? This cannot be undone.`}
        destructive
        confirmLabel="Remove"
        onConfirm={confirmDelete}
      />
    </>
  )
}
