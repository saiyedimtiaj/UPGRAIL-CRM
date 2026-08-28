"use client"

import * as React from "react"
import type { UseFormRegisterReturn } from "react-hook-form"
import { Eye, EyeOff, Lock } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

type PasswordFieldProps = {
  id: string
  label?: string
} & (
  | { registration: UseFormRegisterReturn; value?: never; onChange?: never }
  | { registration?: never; value: string; onChange: (value: string) => void }
)

export function PasswordField({
  id,
  label = "Password",
  registration,
  value,
  onChange,
}: PasswordFieldProps) {
  const [visible, setVisible] = React.useState(false)

  const controlledProps = registration
    ? { ...registration }
    : { value, onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value) }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Lock
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400"
        />
        <Input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete="current-password"
          // Matches the email field: larger tap target on mobile, and a
          // >=16px base size so iOS Safari doesn't zoom the page on focus.
          className="h-12 pr-12 pl-11 sm:h-11"
          {...controlledProps}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute top-1/2 right-1.5 h-9 w-9 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {visible ? (
            <EyeOff aria-hidden className="h-4 w-4" />
          ) : (
            <Eye aria-hidden className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}
