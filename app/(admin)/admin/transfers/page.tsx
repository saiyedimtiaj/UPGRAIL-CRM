"use client"

import { useMe } from "@/features/use-auth"
import { LockScreen } from "@/components/primitives/lock-screen"
import { TransfersTable } from "@/app/(admin)/admin/transfers/_ui/transfers-table"
import ComingSoon from "@/components/shared/cooming-soon"

export default function TransfersPage() {
  const { data: me } = useMe()
  return <ComingSoon />

  if (me && me?.role.name !== "OWNER" && me?.role.name !== "PARTNER") {
    return (
      <div className="w-full p-4 sm:p-6">
        <LockScreen
          title="Transfer Money Access Restricted"
          description="Moving money between Nazmul, UpGrail Bank, and Profit Bank is an Owner/Partner-only action."
        />
      </div>
    )
  }

  return (
    <div className="w-full space-y-5 p-4 sm:space-y-6 sm:p-6">
      <TransfersTable />
    </div>
  )
}
