import { api } from "@/lib/axios"
import type { AppNotification, PaginatedResponse } from "@/lib/types"

export interface NotificationListParams {
  page?: number
  limit?: number
  unreadOnly?: boolean
}

export async function getNotifications(
  params: NotificationListParams = {}
): Promise<PaginatedResponse<AppNotification>> {
  const { data } = await api.get("/notifications", { params })
  return data
}

export async function getUnreadCount(): Promise<{ count: number }> {
  const { data } = await api.get("/notifications/unread-count")
  return data
}

export async function markNotificationRead(id: number): Promise<void> {
  await api.patch(`/notifications/${id}/read`)
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.post("/notifications/mark-all-read")
}
