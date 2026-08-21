"use client"

import { Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

import { useUpdateUser, useUsers } from "@/features/use-users"
import { getErrorMessage } from "@/lib/handleError"
import { SectionCard } from "@/components/primitives/section-card"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"

export function ProfitVisibilityCard() {
  const { data: usersPage, isPending } = useUsers({ limit: 100 })
  const updateUser = useUpdateUser()

  const staffUsers = (usersPage?.data ?? []).filter((u) => u.role.name === "STAFF")

  async function toggle(userId: number, name: string, current: boolean) {
    try {
      await updateUser.mutateAsync({ id: userId, canViewProfit: !current })
      toast.success(`Profit visibility for ${name} ${current ? "revoked" : "granted"}.`)
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update profit visibility"))
    }
  }

  return (
    <SectionCard
      title="Staff Profit Visibility"
      subtitle="Control which staff accounts can view the profit pool"
    >
      <div className="space-y-3">
        {isPending &&
          Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}

        {!isPending && staffUsers.length === 0 && (
          <p className="text-sm text-slate-400">No staff accounts yet.</p>
        )}

        {staffUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
          >
            <div className="flex items-center gap-2.5">
              {user.canViewProfit ? (
                <Eye className="h-4 w-4 text-emerald-600" />
              ) : (
                <EyeOff className="h-4 w-4 text-slate-400" />
              )}
              <div>
                <div className="text-sm font-bold text-slate-900">
                  {user.name}
                </div>
                <div className="text-[11px] text-slate-400">{user.email}</div>
              </div>
            </div>
            <Switch
              checked={!!user.canViewProfit}
              onCheckedChange={() => toggle(user.id, user.name, user.canViewProfit)}
            />
          </div>
        ))}
      </div>
    </SectionCard>
  )
}
