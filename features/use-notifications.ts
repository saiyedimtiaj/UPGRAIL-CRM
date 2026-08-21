"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import * as notificationsApi from "@/services/notifications.api"
import type { NotificationListParams } from "@/services/notifications.api"
import { QK } from "@/features/query-keys"

export const useNotifications = (params: NotificationListParams = {}) =>
  useQuery({
    queryKey: [QK.notifications, "list", params],
    queryFn: () => notificationsApi.getNotifications(params),
    placeholderData: keepPreviousData,
  })

/** Fallback poll in case the Pusher socket hasn't connected yet or push is disabled server-side. */
export const useUnreadNotificationCount = () =>
  useQuery({
    queryKey: [QK.notifications, "unread-count"],
    queryFn: notificationsApi.getUnreadCount,
    refetchInterval: 60_000,
  })

function useInvalidateNotifications() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: [QK.notifications] })
}

export const useMarkNotificationRead = () => {
  const invalidate = useInvalidateNotifications()
  return useMutation({
    mutationFn: (id: number) => notificationsApi.markNotificationRead(id),
    onSuccess: invalidate,
  })
}

export const useMarkAllNotificationsRead = () => {
  const invalidate = useInvalidateNotifications()
  return useMutation({
    mutationFn: notificationsApi.markAllNotificationsRead,
    onSuccess: invalidate,
  })
}
