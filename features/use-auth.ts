"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import * as authApi from "@/services/auth.api"
import type { TUser } from "@/types/auth.types"

const AUTH_KEY = "auth"
export const meQueryKey = [AUTH_KEY, "me"] as const

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
    onSuccess: (data) => {
      qc.setQueryData(meQueryKey, data.user)
    },
  })
}

export const useLogout = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: authApi.logout,
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
