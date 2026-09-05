import { api } from "@/lib/axios"

export interface Role {
  id: number
  name: string
  label: string
  description: string | null
  is_system: boolean
  /** The owner role holds everything implicitly and cannot be edited. */
  is_owner: boolean
  user_count: number
  permission_ids: number[]
}

export interface PermissionItem {
  id: number
  key: string
  action: "view" | "create" | "edit" | "delete" | "section"
  label: string
  description: string | null
}

export interface PermissionGroup {
  resource: string
  permissions: PermissionItem[]
}

export async function getRoles(): Promise<Role[]> {
  const { data } = await api.get("/roles")
  return data
}

export async function getPermissionCatalogue(): Promise<PermissionGroup[]> {
  const { data } = await api.get("/roles/permissions")
  return data
}

export interface CreateRolePayload {
  label: string
  description?: string
  permissionIds?: number[]
}

export async function createRole(payload: CreateRolePayload): Promise<Role> {
  const { data } = await api.post("/roles", payload)
  return data
}

export async function updateRole(
  id: number,
  payload: { label?: string; description?: string },
): Promise<Role> {
  const { data } = await api.patch(`/roles/${id}`, payload)
  return data
}

/** Replaces the role's grants wholesale — always send the complete set. */
export async function setRolePermissions(
  id: number,
  permissionIds: number[],
): Promise<Role> {
  const { data } = await api.put(`/roles/${id}/permissions`, { permissionIds })
  return data
}

export async function deleteRole(id: number): Promise<{ message: string }> {
  const { data } = await api.delete(`/roles/${id}`)
  return data
}
