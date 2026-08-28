"use client"

import * as React from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowRight,
  CheckCircle2,
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
      <header className="space-y-2">
        <h1 className="text-[1.75rem] leading-tight font-bold tracking-tight text-slate-900 sm:text-3xl">
          Reset your password
        </h1>
        <p className="text-[0.9375rem] text-slate-500">
          Enter your email and we&apos;ll send you a recovery link.
        </p>
      </header>

      {sent ? (
        <div className="flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
          <p className="text-sm text-sky-900">
            If an account exists for that email, a password reset link is on its
            way. The link expires in 60 minutes.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                placeholder="name@adfund.com"
                className="h-12 pl-11 sm:h-11"
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
            className="h-12 w-full gap-2 text-[0.9375rem] font-semibold sm:h-11"
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
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-200 py-3 text-sm font-semibold sm:py-2.5 text-slate-700 transition-colors hover:border-sky-300 hover:bg-sky-50/60 hover:text-sky-700"
      >
        Back to sign in
      </Link>

      <p className="text-center text-[11px] text-slate-400">
        Protected by institutional 256-bit encryption &amp; audit logging.
      </p>
    </div>
  )
}
