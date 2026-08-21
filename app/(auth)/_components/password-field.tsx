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
        <Lock className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <Input
          id={id}
          type={visible ? "text" : "password"}
          required
          className="pr-10 pl-9"
          {...controlledProps}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setVisible((v) => !v)}
          className="absolute top-1/2 right-1 -translate-y-1/2 text-slate-400"
        >
          {visible ? (
            <EyeOff className="h-3.5 w-3.5" />
          ) : (
            <Eye className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    </div>
  )
}
