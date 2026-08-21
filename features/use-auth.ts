"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import * as authApi from "@/services/auth.api"
import { setAuthTokenAction, removeAuthTokenAction } from "@/lib/cookies"

const AUTH_KEY = "auth"

/** A 401 here means "not signed in", not an error to surface. */
export const useMe = () =>
  useQuery({
    queryKey: [AUTH_KEY, "me"],
    queryFn: authApi.getMe,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

export const useSignIn = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: authApi.signIn,
    onSuccess: async (data) => {
      // Mirrors token into a cookie so RSC layouts/middleware can read the session too (see lib/axios.ts).
      await setAuthTokenAction(data.access_token, data.expiresInSeconds)
      qc.setQueryData([AUTH_KEY, "me"], data.user)
    },
  })
}


export const useLogout = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: async () => {
      await removeAuthTokenAction()
      qc.setQueryData([AUTH_KEY, "me"], null)
      qc.clear()
    },
  })
}

export const useChangePassword = () => useMutation({ mutationFn: authApi.changePassword })

export const useForgotPassword = () =>
  useMutation({ mutationFn: authApi.forgotPassword })

export const useResetPassword = () =>
  useMutation({ mutationFn: authApi.resetPassword })
