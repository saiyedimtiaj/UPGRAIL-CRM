import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"

const BROWSER_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_PATH || "/api/v1"

const SERVER_BASE_URL = `${
  process.env.API_ORIGIN || "http://localhost:8000"
}/api/v1`

export const api = axios.create({
  baseURL: typeof window === "undefined" ? SERVER_BASE_URL : BROWSER_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
})

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

const AUTH_ENDPOINTS = [
  "/auth/sign-in",
  "/auth/forgot-password",
  "/auth/reset-password",
]
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
