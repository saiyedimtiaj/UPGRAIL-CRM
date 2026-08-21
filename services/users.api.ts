import { api } from "@/lib/axios"
import type { UserRole } from "@/lib/types"

export interface TAdminUser {
  id: number
  name: string
  email: string
  contact: string | null
  avatar: string | null
  tag: string | null
  canViewProfit: boolean
  status: "ACTIVE" | "INACTIVE"
  roleId: number
  role: { id: number; name: UserRole; label: string }
  createdAt: string
  updatedAt: string
}

export interface UserListParams {
  page?: number
  limit?: number
}

export interface AdminUserListResponse {
  data: TAdminUser[]
  meta: {
    totalCount: number
    totalPages: number
    currentPage: number
    limit: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export async function getUsers(params: UserListParams = {}): Promise<AdminUserListResponse> {
  const { data } = await api.get("/users", { params })
  return data
}

export async function getUser(id: number): Promise<TAdminUser> {
  const { data } = await api.get(`/users/${id}`)
  return data
}

export interface CreateUserPayload {
  name: string
  email: string
  password: string
  contact?: string
  role?: UserRole
}

export async function createUser(payload: CreateUserPayload): Promise<TAdminUser> {
  const { data } = await api.post("/users", payload)
  return data
}

export interface UpdateUserPayload {
  name?: string
  email?: string
  contact?: string
  role?: UserRole
  canViewProfit?: boolean
  active?: boolean
}

export async function updateUser(id: number, payload: UpdateUserPayload): Promise<TAdminUser> {
  const { data } = await api.patch(`/users/${id}`, payload)
  return data
}

export async function deleteUser(id: number): Promise<{ message: string }> {
  const { data } = await api.delete(`/users/${id}`)
  return data
}
