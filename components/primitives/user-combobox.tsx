"use client"

import type { User } from "@/lib/types"
import { SearchableSelect } from "@/components/primitives/searchable-select"

interface UserComboboxProps {
  users: User[]
  value: number | undefined
  onChange: (value: number) => void
  placeholder?: string
  disabled?: boolean
  id?: string
  className?: string
}

/** Type-to-filter picker for team accounts (owner / partner / staff) — used
 *  wherever a specific user needs to be selected, e.g. the Settings user
 *  switcher. Shows role + email as the sublabel to disambiguate. */
export function UserCombobox({
  users,
  value,
  onChange,
  placeholder = "Select user...",
  disabled,
  id,
  className,
}: UserComboboxProps) {
  return (
    <SearchableSelect
      id={id}
      className={className}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      searchPlaceholder="Search team members..."
      emptyMessage="No matching users."
      options={users.map((u) => ({
        value: u.id,
        label: u.name,
        sublabel: `${u.role.charAt(0)}${u.role.slice(1).toLowerCase()} · ${u.email}`,
      }))}
    />
  )
}
