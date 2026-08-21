"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { KeyRound, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { changePasswordSchema, type ChangePasswordFormValues } from "@/schema/auth.schema"
import { useChangePassword } from "@/features/use-auth"
import { getErrorMessage } from "@/lib/handleError"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PasswordField } from "@/app/(auth)/_components/password-field"

export function ChangePasswordForm() {
  const changePassword = useChangePassword()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmNewPassword: "" },
  })

  async function onSubmit(values: ChangePasswordFormValues) {
    try {
      await changePassword.mutateAsync(values)
      toast.success("Password updated successfully")
      reset()
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update password"))
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-emerald-600" />
          <CardTitle>Change Password</CardTitle>
        </div>
        <CardDescription>
          Choose a strong password you don&apos;t use anywhere else.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm space-y-4">
          <div className="space-y-1.5">
            <PasswordField
              id="currentPassword"
              label="Current Password"
              registration={register("currentPassword")}
            />
            {errors.currentPassword && (
              <p className="text-xs text-red-600">{errors.currentPassword.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <PasswordField
              id="newPassword"
              label="New Password"
              registration={register("newPassword")}
            />
            {errors.newPassword && (
              <p className="text-xs text-red-600">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <PasswordField
              id="confirmNewPassword"
              label="Confirm New Password"
              registration={register("confirmNewPassword")}
            />
            {errors.confirmNewPassword && (
              <p className="text-xs text-red-600">{errors.confirmNewPassword.message}</p>
            )}
          </div>

          <Button type="submit" disabled={changePassword.isPending} className="gap-1.5">
            {changePassword.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Update Password
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
