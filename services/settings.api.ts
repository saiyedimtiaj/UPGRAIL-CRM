import { api } from "@/lib/axios"
import type { BusinessSettings, UpdateBusinessSettingsPayload } from "@/lib/types"

export async function getSettings(): Promise<BusinessSettings> {
  const { data } = await api.get("/settings")
  return data
}

export async function updateSettings(
  payload: UpdateBusinessSettingsPayload,
): Promise<BusinessSettings> {
  const { data } = await api.patch("/settings", payload)
  return data
}
