"use client"

import { TransfersTable } from "@/app/(admin)/admin/transfers/_ui/transfers-table"

export default function TransfersPage() {

  return (
    <div className="w-full space-y-5 p-4 sm:space-y-6 sm:p-6">
      <TransfersTable />
    </div>
  )
}
