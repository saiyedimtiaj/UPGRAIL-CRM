"use server"

import { cookies } from "next/headers"

/** Mirrors the backend's Set-Cookie so Server Components/middleware can read
 *  the same token without `withCredentials` (browser-only). */

const ACCESS_TOKEN_COOKIE = "access_token"
const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 24 * 60 * 60 

export async function setAuthTokenAction(token: string, maxAgeSeconds?: number) {
  const cookieStore = await cookies()
  cookieStore.set(ACCESS_TOKEN_COOKIE, token, {
    path: "/",
    maxAge: maxAgeSeconds ?? ACCESS_TOKEN_MAX_AGE_SECONDS,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  })
  return { success: true }
}

export async function getAuthTokenAction(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null
}

export async function removeAuthTokenAction() {
  const cookieStore = await cookies()
  cookieStore.delete(ACCESS_TOKEN_COOKIE)
  return { success: true }
}
