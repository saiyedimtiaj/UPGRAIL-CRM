import "server-only"

import { cookies } from "next/headers"

const ACCESS_TOKEN_COOKIE = "access_token"

/**
 * Reads the auth cookie on the server.
 *
 * There is deliberately no setter here. The API is the only writer of this
 * cookie: it issues the token and sets it in the same response. A second
 * writer on the Next side used to create a *different* cookie of the same
 * name on the app's origin, which the API could never see — the cause of the
 * "logged in but every request 401s" failure in any non-localhost deploy.
 */
export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null
}
