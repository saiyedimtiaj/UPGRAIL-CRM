"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import * as usersApi from "@/services/users.api"
import type { CreateUserPayload, UpdateUserPayload, UserListParams } from "@/services/users.api"
import { QK } from "@/features/query-keys"

export const useUsers = (params: UserListParams = {}) =>
  useQuery({
    queryKey: [QK.users, "list", params],
    queryFn: () => usersApi.getUsers(params),
    placeholderData: keepPreviousData,
  })

export const useUser = (id: number | null) =>
  useQuery({
    queryKey: [QK.users, "detail", id],
    queryFn: () => usersApi.getUser(id as number),
    enabled: id !== null,
  })

function useInvalidateUsers() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: [QK.users] })
}

export const useCreateUser = () => {
  const invalidate = useInvalidateUsers()
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => usersApi.createUser(payload),
    onSuccess: invalidate,
  })
}

export const useUpdateUser = () => {
  const invalidate = useInvalidateUsers()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number } & UpdateUserPayload) =>
      usersApi.updateUser(id, payload),
    onSuccess: invalidate,
  })
}

export const useDeleteUser = () => {
  const invalidate = useInvalidateUsers()
  return useMutation({
    mutationFn: (id: number) => usersApi.deleteUser(id),
    onSuccess: invalidate,
  })
}
