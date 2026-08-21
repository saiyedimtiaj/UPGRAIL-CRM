"use client"

import { UserRound } from "lucide-react"

import { useMe } from "@/features/use-auth"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AvatarImage } from "@/components/primitives/avatar-image"

export function ProfileCard() {
  const { data: user, isPending } = useMe()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserRound className="h-4 w-4 text-emerald-600" />
          <CardTitle>Profile</CardTitle>
        </div>
        <CardDescription>Your account details for this session.</CardDescription>
      </CardHeader>
      <CardContent>
        {isPending || !user ? (
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <AvatarImage src={user.avatar ?? ""} name={user.name} className="h-12 w-12" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">{user.name}</span>
                <Badge variant="outline" className="text-[10px] font-bold uppercase">
                  {user.role.label}
                </Badge>
              </div>
              <p className="truncate text-sm text-slate-500">{user.email}</p>
              {user.contact && <p className="text-xs text-slate-400">{user.contact}</p>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
