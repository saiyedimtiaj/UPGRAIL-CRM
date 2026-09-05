"use client"

import * as React from "react"
import { toast } from "sonner"
import { Lock, Plus, ShieldCheck, Trash2, Users2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { getErrorMessage } from "@/lib/handleError"
import {
  useCreateRole,
  useDeleteRole,
  usePermissionCatalogue,
  useRoles,
  useSetRolePermissions,
} from "@/features/use-roles"
import { SectionCard } from "@/components/primitives/section-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Modal } from "@/components/primitives/modal"
import { SubmitButton } from "@/components/primitives/submit-button"
import { ConfirmDialog } from "@/components/primitives/confirm-dialog"
import type { PermissionGroup, Role } from "@/services/roles.api"

export function RolesManager() {
  const { data: roles = [], isPending: rolesPending } = useRoles()
  const { data: catalogue = [], isPending: catPending } =
    usePermissionCatalogue()

  const [selectedId, setSelectedId] = React.useState<number | null>(null)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [deleteTarget, setDeleteTarget] = React.useState<Role | null>(null)
  const remove = useDeleteRole()

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await remove.mutateAsync(deleteTarget.id)
      toast.success(`Role "${deleteTarget.label}" deleted.`)
      if (selectedId === deleteTarget.id) setSelectedId(null)
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not delete the role."))
    } finally {
      setDeleteTarget(null)
    }
  }

  const selected =
    roles.find((r) => r.id === selectedId) ?? roles.find((r) => !r.is_owner) ?? null

  if (rolesPending || catPending) {
    return <Skeleton className="h-96 w-full rounded-card" />
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Roles as a row of cards rather than a third sidebar column — the
          matrix below gets the full page width instead of two-thirds of it. */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold tracking-tight text-slate-900">
              Roles
            </h2>
            <p className="text-xs font-medium text-slate-500">
              {roles.length} role{roles.length === 1 ? "" : "s"} · pick one to
              edit what it can do
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {roles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              isSelected={selected?.id === role.id}
              onSelect={() => setSelectedId(role.id)}
              onDelete={() => setDeleteTarget(role)}
            />
          ))}

          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="flex min-h-[104px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-card border-2 border-dashed border-zinc-200 text-slate-400 transition-colors hover:border-emerald-300 hover:text-emerald-600"
          >
            <Plus className="h-4 w-4" />
            <span className="text-xs font-semibold">New role</span>
          </button>
        </div>
      </div>

      {selected ? (
        <PermissionMatrix role={selected} catalogue={catalogue} />
      ) : (
        <SectionCard title="Permissions">
          <p className="py-10 text-center text-sm text-slate-400">
            Select a role to edit what it can do.
          </p>
        </SectionCard>
      )}

      <CreateRoleModal open={createOpen} onOpenChange={setCreateOpen} />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete role"
        description={
          deleteTarget
            ? `"${deleteTarget.label}" will be removed. This cannot be undone.`
            : ""
        }
        destructive
        confirmLabel="Delete role"
        isConfirming={remove.isPending}
        onConfirm={handleDelete}
      />
    </div>
  )
}

/**
 * A selectable role tile — the replacement for what used to be a third
 * sidebar column. The selected one gets the same emerald-ring accent
 * StatCard uses, so "this is the active thing" reads consistently app-wide.
 */
function RoleCard({
  role,
  isSelected,
  onSelect,
  onDelete,
}: {
  role: Role
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
}) {
  return (
    <div
      className={cn(
        "group relative flex min-h-[104px] flex-col justify-between rounded-card border p-4 transition-all",
        isSelected
          ? "border-emerald-300 bg-emerald-50/40 shadow-sm ring-1 ring-emerald-200"
          : "border-zinc-200/90 bg-white hover:border-emerald-200 hover:shadow-sm",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex w-full min-w-0 cursor-pointer items-start gap-2.5 text-left"
      >
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1",
            role.is_owner
              ? "bg-amber-50 text-amber-600 ring-amber-200"
              : isSelected
                ? "bg-emerald-500/15 text-emerald-700 ring-emerald-500/25"
                : "bg-slate-100 text-slate-500 ring-slate-200",
          )}
        >
          {role.is_owner ? (
            <Lock className="h-4 w-4" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold text-slate-900">
            {role.label}
          </span>
          <span className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
            <Users2 className="h-3 w-3" />
            {role.user_count} user{role.user_count === 1 ? "" : "s"}
          </span>
          <span className="mt-0.5 block text-[11px] font-semibold text-emerald-700">
            {role.is_owner
              ? "Full access"
              : `${role.permission_ids.length} permission${role.permission_ids.length === 1 ? "" : "s"}`}
          </span>
        </span>
      </button>

      {!role.is_system && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
          aria-label={`Delete ${role.label}`}
          className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5 text-slate-400" />
        </Button>
      )}
    </div>
  )
}

/**
 * The grant editor.
 *
 * Changes are staged locally and saved in one go rather than firing a request
 * per checkbox: setting up a role means ticking a dozen boxes, and a partial
 * save halfway through would leave a role in a state nobody chose.
 */
function PermissionMatrix({
  role,
  catalogue,
}: {
  role: Role
  catalogue: PermissionGroup[]
}) {
  const save = useSetRolePermissions()
  const [draft, setDraft] = React.useState<Set<number>>(
    () => new Set(role.permission_ids),
  )

  // Switching role discards any unsaved ticks rather than carrying them over.
  const [seenRole, setSeenRole] = React.useState(role.id)
  if (seenRole !== role.id) {
    setSeenRole(role.id)
    setDraft(new Set(role.permission_ids))
  }

  const dirty =
    draft.size !== role.permission_ids.length ||
    role.permission_ids.some((id) => !draft.has(id))

  function toggle(id: number) {
    setDraft((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleGroup(group: PermissionGroup, on: boolean) {
    setDraft((prev) => {
      const next = new Set(prev)
      for (const p of group.permissions) {
        if (on) next.add(p.id)
        else next.delete(p.id)
      }
      return next
    })
  }

  async function handleSave() {
    try {
      await save.mutateAsync({ id: role.id, permissionIds: [...draft] })
      toast.success(`${role.label} updated.`)
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not save permissions."))
    }
  }

  if (role.is_owner) {
    return (
      <SectionCard title={role.label} subtitle="System role">
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-900">
            <Lock className="h-4 w-4" />
            Always has full access
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-amber-800/80">
            The Owner role holds every permission automatically, including any
            added by future updates. It cannot be edited or deleted — that is
            what makes it impossible to lock yourself out of this screen.
          </p>
        </div>
      </SectionCard>
    )
  }

  return (
    <SectionCard
      title={role.label}
      subtitle={
        role.description ??
        `${draft.size} permission${draft.size === 1 ? "" : "s"} selected`
      }
      action={
        <SubmitButton
          size="sm"
          disabled={!dirty}
          isSubmitting={save.isPending}
          pendingLabel="Saving…"
          onClick={handleSave}
        >
          Save changes
        </SubmitButton>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {catalogue.map((group) => {
          const ids = group.permissions.map((p) => p.id)
          const on = ids.filter((id) => draft.has(id)).length
          const all = on === ids.length

          return (
            <div
              key={group.resource}
              className="flex h-full flex-col rounded-xl border border-zinc-200 p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-slate-900">
                  {group.resource}
                </span>
                <button
                  type="button"
                  onClick={() => toggleGroup(group, !all)}
                  className="cursor-pointer text-[11px] font-semibold text-emerald-700 hover:underline"
                >
                  {all ? "Clear all" : "Select all"}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {group.permissions.map((p) => (
                  <label
                    key={p.id}
                    className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5 hover:bg-slate-50"
                  >
                    <Checkbox
                      checked={draft.has(p.id)}
                      onCheckedChange={() => toggle(p.id)}
                      className="mt-0.5"
                    />
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold text-slate-700">
                        {p.label}
                      </span>
                      {p.description && (
                        <span className="block text-[11px] text-slate-400">
                          {p.description}
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}

function CreateRoleModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const create = useCreateRole()
  const [label, setLabel] = React.useState("")
  const [description, setDescription] = React.useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!label.trim()) return
    try {
      await create.mutateAsync({
        label: label.trim(),
        description: description.trim() || undefined,
      })
      toast.success(`Role "${label.trim()}" created.`)
      setLabel("")
      setDescription("")
      onOpenChange(false)
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not create the role."))
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="New role"
      description="Create the role first, then tick what it can do."
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="role-label">Name</Label>
          <Input
            id="role-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Primary Seller"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="role-description">Description</Label>
          <Input
            id="role-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Sees everything, changes nothing"
          />
        </div>
        <SubmitButton
          type="submit"
          className="w-full"
          isSubmitting={create.isPending}
          pendingLabel="Creating…"
        >
          Create role
        </SubmitButton>
      </form>
    </Modal>
  )
}

