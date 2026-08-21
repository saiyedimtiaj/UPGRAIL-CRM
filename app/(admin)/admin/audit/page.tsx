"use client"

import * as React from "react"

import type { AuditAction } from "@/lib/types"
import { useAuditLog } from "@/features/use-audit"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { PAGE_SIZE } from "@/lib/pagination"
import { AuditFilters } from "@/app/(admin)/admin/audit/_ui/audit-filters"
import { AuditTable } from "@/app/(admin)/admin/audit/_ui/audit-table"

export default function AuditPage() {
  const [search, setSearch] = React.useState("")
  const [action, setAction] = React.useState<AuditAction | "all">("all")
  const [page, setPage] = React.useState(1)

  const debouncedSearch = useDebouncedValue(search)

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  function handleActionChange(value: AuditAction | "all") {
    setAction(value)
    setPage(1)
  }

  const { data, isPending, isFetching } = useAuditLog({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    action: action === "all" ? undefined : action,
  })

  return (
    <div className="w-full space-y-5 p-4 sm:space-y-6 sm:p-6">
      <AuditFilters
        search={search}
        onSearchChange={handleSearchChange}
        action={action}
        onActionChange={handleActionChange}
      />
      <AuditTable
        entries={data?.data ?? []}
        meta={data?.meta}
        isLoading={isPending}
        isFetching={isFetching}
        onPageChange={setPage}
      />
    </div>
  )
}
