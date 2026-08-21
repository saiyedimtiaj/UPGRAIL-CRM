"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Eye, Plus } from "lucide-react"

import { useClients, useDeleteClient } from "@/features/use-clients"
import { useBalances } from "@/features/use-analytics"
import { useMe } from "@/features/use-auth"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { getErrorMessage } from "@/lib/handleError"
import { shortDate } from "@/lib/date"
import { PAGE_SIZE, toDataTablePagination } from "@/lib/pagination"
import { SectionCard } from "@/components/primitives/section-card"
import DataTable, {
  type DataTableColumn,
} from "@/components/shared/data-table"
import { RowActions } from "@/components/shared/row-actions"
import { ConfirmDialog } from "@/components/primitives/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Bdt } from "@/components/primitives/money"
import { ActivePill } from "@/components/primitives/active-pill"
import { AddClientModal } from "@/components/shared/add-client-modal"
import type { Client } from "@/lib/types"
import {
  ClientsFilters,
  type ClientsFiltersState,
} from "./clients-filters"

const EMPTY_FILTERS: ClientsFiltersState = { search: "", active: "all" }

// Delete is "smart": a client referenced by any trade or payment gets
// soft-deactivated instead of removed, so historical balances stay intact.
export function ClientsTable() {
  const router = useRouter()
  const [page, setPage] = React.useState(1)
  const [filters, setFilters] = React.useState<ClientsFiltersState>(EMPTY_FILTERS)
  const debouncedSearch = useDebouncedValue(filters.search)

  const { data, isPending, isFetching } = useClients({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    active: filters.active === "all" ? undefined : filters.active === "true",
  })
  const { data: balancesData } = useBalances()
  const { data: me } = useMe()
  const deleteClient = useDeleteClient()

  const clients = data?.data ?? []
  const clientDues = balancesData?.clientDues ?? {}

  const [addOpen, setAddOpen] = React.useState(false)
  const [editTarget, setEditTarget] = React.useState<Client | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<Client | null>(null)

  const canManage = me?.role.name === "OWNER" || me?.role.name === "PARTNER"

  function handleFiltersChange(next: ClientsFiltersState) {
    setFilters(next)
    setPage(1)
  }

  const columns: DataTableColumn<Client>[] = [
    {
      key: "name",
      header: "Client",
      cell: (c) => (
        <Link href={`/admin/clients/${c.id}`} className="group/link block outline-none">
          <div className="font-bold text-slate-900 underline-offset-4 group-hover/link:text-emerald-700 group-hover/link:underline">
            {c.name}
          </div>
          <div className="text-[11px] text-slate-400">{c.company}</div>
        </Link>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      cell: (c) => <span className="text-slate-600">{c.contact || "—"}</span>,
      hideBelow: "md",
    },
    {
      key: "region",
      header: "Region",
      cell: (c) => <span className="text-slate-600">{c.region}</span>,
      hideBelow: "lg",
    },
    {
      key: "balance",
      header: "Balance (Receivable)",
      align: "right",
      cell: (c) => <Bdt value={clientDues[c.id] ?? 0} className="font-semibold" />,
    },
    {
      key: "status",
      header: "Status",
      cell: (c) => <ActivePill active={c.active} />,
    },
    {
      key: "created",
      header: "Added",
      cell: (c) => shortDate(c.created_at),
      hideBelow: "xl",
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (c) => (
        <RowActions
          disabled={!canManage}
          onEdit={() => setEditTarget(c)}
          onDelete={() => setDeleteTarget(c)}
          extraActions={[
            {
              label: "View Details",
              icon: Eye,
              onSelect: () => router.push(`/admin/clients/${c.id}`),
            },
          ]}
        />
      ),
    },
  ]

  return (
    <>
      <SectionCard
        title="Client Directory"
        subtitle={`${data?.meta.totalCount ?? 0} client(s) in the directory`}
        action={
          canManage ? (
            <Button size="sm" onClick={() => setAddOpen(true)} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Add Client
            </Button>
          ) : undefined
        }
      >
        <div className="mb-4">
          <ClientsFilters value={filters} onChange={handleFiltersChange} />
        </div>
        <div className={isFetching && !isPending ? "opacity-60 transition-opacity" : undefined}>
          <DataTable
            columns={columns}
            data={clients}
            rowKey={(c) => c.id}
            entityLabel="clients"
            isLoading={isPending}
            pagination={toDataTablePagination(data?.meta)}
            onPageChange={setPage}
            rowClassName={(c) => (c.active ? "" : "opacity-60")}
          />
        </div>
      </SectionCard>

      <AddClientModal open={addOpen} onOpenChange={setAddOpen} mode="create" />

      <AddClientModal
        open={editTarget !== null}
        onOpenChange={(open) => !open && setEditTarget(null)}
        mode="edit"
        initial={editTarget ?? undefined}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remove Client"
        description={`Remove ${deleteTarget?.name ?? "this client"}? If they have trade or payment history, they'll be deactivated instead of deleted so historical balances stay intact.`}
        destructive
        confirmLabel="Remove"
        onConfirm={async () => {
          if (!deleteTarget) return
          try {
            const result = await deleteClient.mutateAsync(deleteTarget.id)
            toast.success(result.message ?? `${deleteTarget.name} removed.`)
          } catch (error) {
            toast.error(getErrorMessage(error, "Failed to remove client."))
          } finally {
            setDeleteTarget(null)
          }
        }}
      />
    </>
  )
}
