import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"

/**
 * On the client, `withCredentials: true` sends the httpOnly access_token
 * cookie automatically. On the server, axios doesn't forward cookies, so the
 * interceptor below reads it via `next/headers` and sets Authorization
 * explicitly — but only server-side, to avoid doing it on every client call.
 * No refresh flow: a 401 outside auth endpoints just redirects to sign-in.
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
})

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (typeof window === "undefined") {
      const { getAuthTokenAction } = await import("@/lib/cookies")
      const token = await getAuthTokenAction()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

const AUTH_ENDPOINTS = ["/auth/sign-in"]

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const requestUrl = error.config?.url ?? ""
    const isAuthEndpoint = AUTH_ENDPOINTS.some((p) => requestUrl.includes(p))

    if (error.response?.status === 401 && typeof window !== "undefined" && !isAuthEndpoint) {
      window.location.href = "/sign-in"
    }

    return Promise.reject(error)
  },
)
