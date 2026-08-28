import "server-only"

import { cookies } from "next/headers"

const ACCESS_TOKEN_COOKIE = "access_token"

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null
}
