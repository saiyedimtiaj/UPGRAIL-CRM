"use client"

import * as React from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowRight,
  CheckCircle2,
  KeySquare,
  Loader2,
  Mail,
} from "lucide-react"

import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/schema/auth.schema"
import { useForgotPassword } from "@/features/use-auth"
import { getErrorMessage } from "@/lib/handleError"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { BrandMark } from "@/components/layout/brand-mark"

// Backend returns the same response regardless of whether the email has an
// account, so this screen must show the same confirmation either way —
// otherwise it becomes a way to enumerate registered emails.
export default function ForgotPasswordPage() {
  const forgotPassword = useForgotPassword()
  const [sent, setSent] = React.useState(false)
  const [serverError, setServerError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  async function onSubmit(values: ForgotPasswordFormValues) {
    setServerError(null)
    try {
      await forgotPassword.mutateAsync(values)
      setSent(true)
    } catch (error) {
      setServerError(getErrorMessage(error, "Could not send the reset link."))
    }
  }

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
          <KeySquare className="h-5 w-5" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Reset your password
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Enter your email and we&apos;ll send you a recovery link.
        </p>
      </div>

      {sent ? (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <p className="text-sm text-emerald-800">
            If an account exists for that email, a password reset link is on its
            way. The link expires in 60 minutes.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="name@adfund.com"
                className="pl-10"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          {serverError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              {serverError}
            </p>
          )}

          <Button
            type="submit"
            disabled={forgotPassword.isPending}
            className="w-full gap-1.5"
          >
            {forgotPassword.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Send Recovery Link
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      )}

      <div className="flex items-center gap-3 text-xs text-slate-400">
        <div className="h-px flex-1 bg-zinc-100" />
        <span>Remembered it?</span>
        <div className="h-px flex-1 bg-zinc-100" />
      </div>

      <Link
        href="/sign-in"
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-200 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-700"
      >
        Back to sign in
      </Link>

      <p className="text-center text-[11px] text-slate-400">
        Protected by institutional 256-bit encryption &amp; audit logging.
      </p>
    </div>
  )
}
