import { api } from "@/lib/axios"
import type { Client, PaginatedResponse } from "@/lib/types"

export interface ClientListParams {
  page?: number
  limit?: number
  search?: string
  active?: boolean
}

export async function getClients(params: ClientListParams = {}): Promise<PaginatedResponse<Client>> {
  const { data } = await api.get("/clients", { params })
  return data
}

export async function getActiveClients(): Promise<Client[]> {
  const { data } = await api.get("/clients/active")
  return data
}

export async function getClient(id: number): Promise<Client> {
  const { data } = await api.get(`/clients/${id}`)
  return data
}

export interface CreateClientPayload {
  name: string
  company: string
  contact: string
  notes?: string
  region: string
}

export async function createClient(payload: CreateClientPayload): Promise<Client> {
  const { data } = await api.post("/clients", payload)
  return data
}

export async function updateClient(
  id: number,
  payload: Partial<CreateClientPayload> & { active?: boolean },
): Promise<Client> {
  const { data } = await api.patch(`/clients/${id}`, payload)
  return data
}

export async function deleteClient(id: number): Promise<{ message: string }> {
  const { data } = await api.delete(`/clients/${id}`)
  return data
}
