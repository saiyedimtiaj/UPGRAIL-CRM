"use client"

import { useMe } from "@/features/use-auth"
import { LockScreen } from "@/components/primitives/lock-screen"
import { TransferForm } from "@/app/(admin)/admin/transfers/_ui/transfer-form"
import { TransfersTable } from "@/app/(admin)/admin/transfers/_ui/transfers-table"

export default function TransfersPage() {
  const { data: me } = useMe()

  if (me && me.role.name !== "OWNER" && me.role.name !== "PARTNER") {
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <TransferForm />
        </div>
        <div className="lg:col-span-7">
          <TransfersTable />
        </div>
      </div>
    </div>
  )
}
