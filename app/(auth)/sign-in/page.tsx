"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, KeyRound, Loader2, Mail } from "lucide-react"
import { toast } from "sonner"

import { signInSchema, type SignInFormValues } from "@/schema/auth.schema"
import { useSignIn } from "@/features/use-auth"
import { getErrorMessage } from "@/lib/handleError"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { BrandMark } from "@/components/layout/brand-mark"
import { PasswordField } from "@/app/(auth)/_components/password-field"

export default function SignInPage() {
  const router = useRouter()
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
      router.replace("/admin")
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not sign in"))
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
          <KeyRound className="h-5 w-5" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Enter your institutional credentials to access the CRM.
        </p>
      </div>

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

        <div className="space-y-1.5">
          <PasswordField
            id="password"
            registration={register("password")}
          />
          {errors.password && (
            <p className="text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-slate-600">
            <Checkbox defaultChecked />
            Keep me signed in
          </label>
          <Link
            href="/forgot-password"
            className="font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" disabled={signIn.isPending} className="w-full gap-1.5">
          {signIn.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Sign In to Dashboard
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-[11px] text-slate-400">
        Protected by institutional 256-bit encryption &amp; audit logging.
      </p>
    </div>
  )
}
