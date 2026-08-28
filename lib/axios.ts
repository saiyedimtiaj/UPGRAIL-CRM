import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"

/**
 * Where API calls are sent.
 *
 * In the browser this is a *relative* path, so requests go to the app's own
 * origin and are rewritten to the backend by `rewrites()` in next.config.ts.
 * That is what makes the auth cookie first-party — see the note there.
 *
 * On the server there is no origin to be relative to, so we need the
 * backend's absolute URL. `API_ORIGIN` is server-only (no NEXT_PUBLIC_
 * prefix) and never reaches the client bundle.
 */
const BROWSER_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_PATH || "/api/v1"

const SERVER_BASE_URL = `${
  process.env.API_ORIGIN || "http://localhost:8000"
}/api/v1`

export const api = axios.create({
  baseURL: typeof window === "undefined" ? SERVER_BASE_URL : BROWSER_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
})

/**
 * Server-side requests carry no browser cookie jar, so the token is read from
 * the incoming request's cookies and forwarded explicitly. In the browser
 * this is a no-op: the cookie is httpOnly and first-party, so it rides along
 * automatically and JS neither can nor should touch it.
 */
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (typeof window === "undefined") {
      const { cookies } = await import("next/headers")
      const token = (await cookies()).get("access_token")?.value
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Endpoints where a 401 is a legitimate answer ("wrong password") rather than
// an expired session, so they must not trigger the redirect below.
const AUTH_ENDPOINTS = ["/auth/sign-in", "/auth/forgot-password", "/auth/reset-password"]
const AUTH_ROUTES = ["/sign-in", "/forgot-password", "/reset-password"]

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const requestUrl = error.config?.url ?? ""
    const isAuthEndpoint = AUTH_ENDPOINTS.some((p) => requestUrl.includes(p))

    if (
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      !isAuthEndpoint
    ) {
      const isAuthRoute = AUTH_ROUTES.some((route) =>
        window.location.pathname.startsWith(route)
      )

      // The cookie is httpOnly, so the client cannot clear it itself; the
      // sign-in page is what replaces it. A full replace() also discards all
      // in-memory query state, which is what we want after a session ends.
      if (!isAuthRoute) {
        const from = encodeURIComponent(
          window.location.pathname + window.location.search
        )
        window.location.replace(`/sign-in?from=${from}`)
      }
    }

    return Promise.reject(error)
  }
)
