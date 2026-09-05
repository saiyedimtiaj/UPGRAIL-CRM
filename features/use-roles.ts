"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import * as rolesApi from "@/services/roles.api"
import { QK } from "@/features/query-keys"

export const useRoles = () =>
  useQuery({
    queryKey: [QK.roles, "list"],
    queryFn: rolesApi.getRoles,
    staleTime: 60 * 1000,
  })

export const usePermissionCatalogue = () =>
  useQuery({
    queryKey: [QK.roles, "catalogue"],
    queryFn: rolesApi.getPermissionCatalogue,
    // The catalogue only changes on deploy.
    staleTime: 10 * 60 * 1000,
  })

function useInvalidateRoles() {
  const qc = useQueryClient()
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: [QK.roles] }),
      // A role change can alter what the signed-in user may do.
      qc.invalidateQueries({ queryKey: ["auth", "me"] }),
    ])
}

export const useCreateRole = () => {
  const invalidate = useInvalidateRoles()
  return useMutation({
    mutationFn: rolesApi.createRole,
    onSuccess: invalidate,
  })
}

export const useUpdateRole = () => {
  const invalidate = useInvalidateRoles()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number; label?: string; description?: string }) =>
      rolesApi.updateRole(id, payload),
    onSuccess: invalidate,
  })
}

export const useSetRolePermissions = () => {
  const invalidate = useInvalidateRoles()
  return useMutation({
    mutationFn: ({ id, permissionIds }: { id: number; permissionIds: number[] }) =>
      rolesApi.setRolePermissions(id, permissionIds),
    onSuccess: invalidate,
  })
}

export const useDeleteRole = () => {
  const invalidate = useInvalidateRoles()
  return useMutation({
    mutationFn: rolesApi.deleteRole,
    onSuccess: invalidate,
  })
}
