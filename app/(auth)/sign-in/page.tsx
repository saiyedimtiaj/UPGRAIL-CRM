"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, Loader2, Mail } from "lucide-react"
import { toast } from "sonner"

import { signInSchema, type SignInFormValues } from "@/schema/auth.schema"
import { useSignIn } from "@/features/use-auth"
import { getErrorMessage } from "@/lib/handleError"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { PasswordField } from "@/app/(auth)/_components/password-field"

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const signIn = useSignIn()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: SignInFormValues) {
    try {
      await signIn.mutateAsync(values)

      const from = searchParams.get("from")
      router.replace(from && from.startsWith("/admin") ? from : "/admin")
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not sign in"))
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-[1.75rem] leading-tight font-bold tracking-tight text-slate-900 sm:text-3xl">
          Welcome back
        </h1>
        <p className="text-[0.9375rem] text-slate-500">
          Sign in to access the treasury dashboard.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              placeholder="name@adfund.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}

              className="h-12 pl-11 sm:h-11"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p id="email-error" role="alert" className="text-xs text-red-600">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <PasswordField id="password" registration={register("password")} />
          {errors.password && (
            <p
              id="password-error"
              role="alert"
              className="text-xs text-red-600"
            >
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-slate-600 select-none">
            <Checkbox defaultChecked />
            Keep me signed in
          </label>
          <Link
            href="/forgot-password"
            className="rounded font-semibold text-sky-700 underline-offset-4 transition-colors hover:text-sky-800 hover:underline focus-visible:ring-2 focus-visible:ring-sky-500/50 focus-visible:outline-none"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={signIn.isPending}
          className="h-12 w-full gap-2 text-[0.9375rem] font-semibold sm:h-11"
        >
          {signIn.isPending ? (
            <>
              <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <ArrowRight aria-hidden className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <p className="border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
        Protected by 256-bit encryption and full audit logging.
      </p>
    </div>
  )
}

export default function SignInPage() {
  return (
    <React.Suspense fallback={<SignInFormSkeleton />}>
      <SignInForm />
    </React.Suspense>
  )
}

function SignInFormSkeleton() {
  return (
    <div className="space-y-8" aria-hidden>
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-md bg-slate-100" />
        <div className="h-5 w-64 rounded-md bg-slate-100" />
      </div>
      <div className="space-y-5">
        <div className="h-12 w-full rounded-lg bg-slate-100 sm:h-11" />
        <div className="h-12 w-full rounded-lg bg-slate-100 sm:h-11" />
        <div className="h-12 w-full rounded-lg bg-slate-100 sm:h-11" />
      </div>
    </div>
  )
}
