import "server-only"

import { redirect } from "next/navigation"
import { isAxiosError } from "axios"
import { getMe } from "@/services/auth.api"
import { getAuthToken } from "@/lib/cookies"
import type { TUser } from "@/types/auth.types"

function isNextRedirectError(err: unknown): boolean {
  const digest = (err as { digest?: string } | null)?.digest
  return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")
}

export async function getCurrentUserOrRedirect(): Promise<TUser> {
  try {
    const token = await getAuthToken()
    if (!token) redirect("/sign-in")

    const user = await getMe()
    if (!user || typeof user !== "object" || !("id" in user)) {
      redirect("/sign-in")
    }
    return user
  } catch (err: unknown) {
    if (isNextRedirectError(err)) throw err

    const status = isAxiosError(err) ? err.response?.status : undefined
    if (status === 401 || status === 403) redirect("/sign-in")

    throw err
  }
}
