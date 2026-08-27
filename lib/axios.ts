import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"

import { removeAuthTokenAction } from "@/lib/cookies"

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
const AUTH_ROUTES = ["/sign-in", "/forgot-password", "/reset-password"]

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const requestUrl = error.config?.url ?? ""
    const isAuthEndpoint = AUTH_ENDPOINTS.some((p) => requestUrl.includes(p))

    if (error.response?.status === 401 && typeof window !== "undefined" && !isAuthEndpoint) {
      void removeAuthTokenAction().finally(() => {
        const isAuthRoute = AUTH_ROUTES.some((route) =>
          window.location.pathname.startsWith(route),
        )

        if (!isAuthRoute) {
          window.location.replace("/sign-in")
        }
      })
    }

    return Promise.reject(error)
  },
)
