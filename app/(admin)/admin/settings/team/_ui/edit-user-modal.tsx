"use client"

import * as React from "react"
import { toast } from "sonner"

import type { UserRole } from "@/lib/types"
import type { TAdminUser } from "@/services/users.api"
import { useCreateUser, useUpdateUser } from "@/features/use-users"
import { getErrorMessage } from "@/lib/handleError"
import { Modal } from "@/components/primitives/modal"
import { SelectField } from "@/components/primitives/select-field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SubmitButton } from "@/components/primitives/submit-button"
import { PasswordField } from "@/app/(auth)/_components/password-field"

function UserForm({
  mode,
  initial,
  onDone,
}: {
  mode: "create" | "edit"
  initial?: TAdminUser
  onDone: () => void
}) {
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()

  const [name, setName] = React.useState(initial?.name ?? "")
  const [email, setEmail] = React.useState(initial?.email ?? "")
  const [password, setPassword] = React.useState("")
  const [contact, setContact] = React.useState(initial?.contact ?? "")
  const [role, setRole] = React.useState<UserRole>(initial?.role.name ?? "STAFF")

  const isPending = createUser.isPending || updateUser.isPending

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    if (mode === "create" && password.trim().length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    try {
      if (mode === "edit" && initial) {
        await updateUser.mutateAsync({
          id: initial.id,
          name: name.trim(),
          email: email.trim(),
          contact: contact.trim(),
          role,
        })
        toast.success(`${name} updated.`)
      } else {
        await createUser.mutateAsync({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          contact: contact.trim(),
          role,
        })
        toast.success(`${name} added to the team.`)
      }
      onDone()
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not save user"))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="user-name">Name</Label>
        <Input
          id="user-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="user-email">Email</Label>
        <Input
          id="user-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      {mode === "create" && (
        <PasswordField
          id="user-password"
          label="Password"
          value={password}
          onChange={setPassword}
        />
      )}
      <div className="space-y-1.5">
        <Label htmlFor="user-contact">Contact</Label>
        <Input
          id="user-contact"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="user-role">Role</Label>
        <SelectField
          id="user-role"
          value={role}
          onChange={(v) => setRole(v as UserRole)}
          options={[
            { value: "OWNER", label: "Owner" },
            { value: "PARTNER", label: "Partner" },
            { value: "STAFF", label: "Staff" },
          ]}
        />
      </div>
      <SubmitButton
        type="submit"
        className="w-full"
        isSubmitting={isPending}
        pendingLabel={mode === "edit" ? "Saving…" : "Adding member…"}
      >
        {mode === "edit" ? "Save Changes" : "Add Team Member"}
      </SubmitButton>
    </form>
  )
}

export function EditUserModal({
  open,
  onOpenChange,
  mode = "create",
  initial,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode?: "create" | "edit"
  initial?: TAdminUser
}) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "edit" ? "Edit Team Member" : "Add Team Member"}
      description={
        mode === "edit"
          ? "Update this team member's details or role."
          : "Add a new owner, partner, or staff account."
      }
    >
      <UserForm
        key={initial?.id ?? "create"}
        mode={mode}
        initial={initial}
        onDone={() => onOpenChange(false)}
      />
    </Modal>
  )
}
