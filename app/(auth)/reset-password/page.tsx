"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, CheckCircle2, KeyRound, Loader2, TriangleAlert } from "lucide-react"

import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/schema/auth.schema"
import { useResetPassword } from "@/features/use-auth"
import { getErrorMessage } from "@/lib/handleError"
import { Button } from "@/components/ui/button"
import { BrandMark } from "@/components/layout/brand-mark"
import { PasswordField } from "@/app/(auth)/_components/password-field"

function ResetPasswordForm() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get("token") ?? ""
  const resetPassword = useResetPassword()

  const [done, setDone] = React.useState(false)
  const [serverError, setServerError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  })

  async function onSubmit(values: ResetPasswordFormValues) {
    setServerError(null)
    try {
      await resetPassword.mutateAsync({ token, password: values.password })
      setDone(true)
      setTimeout(() => router.push("/sign-in"), 1800)
    } catch (error) {
      setServerError(
        getErrorMessage(error, "This reset link is invalid or has expired."),
      )
    }
  }

  if (!token) {
    return (
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-800">
            This reset link is missing its token. Request a new one below.
          </p>
        </div>
        <Link
          href="/forgot-password"
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-200 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-700"
        >
          Request a new link
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        <p className="text-sm text-emerald-800">
          Password updated. Taking you to sign in&hellip;
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <PasswordField
          id="password"
          label="New Password"
          registration={register("password")}
        />
        {errors.password && (
          <p className="text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <PasswordField
          id="confirmPassword"
          label="Confirm New Password"
          registration={register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
        )}
      </div>

      {serverError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {serverError}
        </p>
      )}

      <Button
        type="submit"
        disabled={resetPassword.isPending}
        className="w-full gap-1.5"
      >
        {resetPassword.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            Set New Password
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="space-y-7">
      <div className="flex items-center gap-3 lg:hidden">
        <BrandMark />
        <span className="flex items-center gap-1 text-lg font-extrabold tracking-tight text-slate-900">
          AdFund<span className="font-medium text-emerald-600">Global</span>
        </span>
      </div>

      <div>
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <KeyRound className="h-5 w-5" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Choose a new password
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Pick something you don&apos;t use anywhere else.
        </p>
      </div>

      <React.Suspense
        fallback={<div className="h-40 animate-pulse rounded-xl bg-slate-100" />}
      >
        <ResetPasswordForm />
      </React.Suspense>

      <Link
        href="/sign-in"
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-200 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-700"
      >
        Back to sign in
      </Link>
    </div>
  )
}
