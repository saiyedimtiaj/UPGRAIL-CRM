"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import * as authApi from "@/services/auth.api"
import type { TUser } from "@/types/auth.types"

const AUTH_KEY = "auth"
export const meQueryKey = [AUTH_KEY, "me"] as const

/**
 * The signed-in user.
 *
 * The admin layout resolves this on the server and seeds the cache with it,
 * so on a normal page load this hook returns immediately and never issues a
 * request. `initialData` is supplied there via HydrationBoundary.
 */
export const useMe = () =>
  useQuery({
    queryKey: meQueryKey,
    queryFn: authApi.getMe,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

export const useSignIn = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: authApi.signIn,
    // No cookie handling here: the API's sign-in response carries the
    // Set-Cookie header and, because requests are same-origin via the
    // rewrite, the browser stores it directly.
    onSuccess: (data) => {
      qc.setQueryData(meQueryKey, data.user)
    },
  })
}

export const useLogout = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: authApi.logout,
    // Runs on failure too: if the revoke call errors, the local session is
    // still gone as far as the user is concerned, and leaving cached
    // financial data in memory would be worse than a redundant clear.
    onSettled: () => {
      qc.setQueryData<TUser | null>(meQueryKey, null)
      qc.clear()
    },
  })
}

export const useChangePassword = () =>
  useMutation({ mutationFn: authApi.changePassword })

export const useForgotPassword = () =>
  useMutation({ mutationFn: authApi.forgotPassword })

export const useResetPassword = () =>
  useMutation({ mutationFn: authApi.resetPassword })
