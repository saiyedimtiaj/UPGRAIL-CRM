"use client"

import * as React from "react"
import Pusher, { type Channel } from "pusher-js"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { api } from "@/lib/axios"
import { QK } from "@/features/query-keys"
import type { AppNotification } from "@/lib/types"

// Module-level singleton, not component state: React Strict Mode double-invokes
// effects in dev, so a naive useEffect(() => new Pusher(...), []) would open
// two sockets and double-fire every toast. Keeping the client/channel outside
// React's render cycle means a remount reuses the existing connection.
let pusherClient: Pusher | null = null
let subscribedChannel: Channel | null = null
let subscriberCount = 0

function getPusherClient(): Pusher | null {
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER
  if (!key || !cluster) return null

  if (!pusherClient) {
    pusherClient = new Pusher(key, {
      cluster,
      authorizer: (channel) => ({
        authorize: async (socketId, callback) => {
          try {
            const { data } = await api.post("/notifications/auth", {
              socket_id: socketId,
              channel_name: channel.name,
            })
            callback(null, data)
          } catch (error) {
            callback(error as Error, null)
          }
        },
      }),
    })
  }
  return pusherClient
}

// Degrades silently when NEXT_PUBLIC_PUSHER_KEY/CLUSTER are unset — the app
// still works via the 60s unread-count poll, just without live push.
export function PusherProvider({
  userId,
  children,
}: {
  userId: number
  children: React.ReactNode
}) {
  const queryClient = useQueryClient()

  React.useEffect(() => {
    const client = getPusherClient()
    if (!client) return

    subscriberCount += 1
    const channelName = `private-user-${userId}`

    if (!subscribedChannel || subscribedChannel.name !== channelName) {
      subscribedChannel?.unbind_all()
      client.unsubscribe(subscribedChannel?.name ?? "")
      subscribedChannel = client.subscribe(channelName)
    }

    const channel = subscribedChannel
    const handler = (notification: AppNotification) => {
      queryClient.invalidateQueries({ queryKey: [QK.notifications] })
      toast(notification.title, { description: notification.body })
    }

    channel.bind("notification", handler)

    return () => {
      channel.unbind("notification", handler)
      subscriberCount -= 1
      if (subscriberCount <= 0) {
        subscriberCount = 0
        client.unsubscribe(channelName)
        if (subscribedChannel === channel) subscribedChannel = null
      }
    }
  }, [userId, queryClient])

  return <>{children}</>
}
