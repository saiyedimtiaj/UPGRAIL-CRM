"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Eye, Plus, ShieldCheck } from "lucide-react"

import { useSellers, useDeleteSeller, useSetSettlementConduit } from "@/features/use-sellers"
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
import { Bdt, Usdt } from "@/components/primitives/money"
import { ActivePill } from "@/components/primitives/active-pill"
import { SellerKindPill } from "@/components/primitives/seller-kind-pill"
import { AddSellerModal } from "@/components/shared/add-seller-modal"
import type { Seller } from "@/lib/types"
import {
  SellersFilters,
  type SellersFiltersState,
} from "./sellers-filters"

const EMPTY_FILTERS: SellersFiltersState = { search: "", active: "all", rateType: "all" }

export function SellersTable() {
  const router = useRouter()
  const [page, setPage] = React.useState(1)
  const [filters, setFilters] = React.useState<SellersFiltersState>(EMPTY_FILTERS)
  const debouncedSearch = useDebouncedValue(filters.search)

  const { data, isPending, isFetching } = useSellers({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    active: filters.active === "all" ? undefined : filters.active === "true",
    rateType: filters.rateType === "all" ? undefined : filters.rateType,
  })
  const { data: balancesData } = useBalances()
  const { data: me } = useMe()
  const deleteSeller = useDeleteSeller()
  const setConduit = useSetSettlementConduit()

  // The settlement conduit is a different kind of counterparty — its balance
  // is in BDT, not USDT — so it gets its own page rather than sitting in a
  // list whose columns do not describe it.
  const sellers = (data?.data ?? []).filter((s) => !s.isSettlementConduit)
  const sellerUsdtDues = balancesData?.sellerUsdtDues ?? {}
  const nazmulDue = balancesData?.nazmulDue ?? 0

  const [addOpen, setAddOpen] = React.useState(false)
  const [editTarget, setEditTarget] = React.useState<Seller | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<Seller | null>(null)
  const [conduitTarget, setConduitTarget] = React.useState<Seller | null>(null)

  const canManage = me?.role.name === "OWNER" || me?.role.name === "PARTNER"
  const isOwner = me?.role.name === "OWNER"

  function handleFiltersChange(next: SellersFiltersState) {
    setFilters(next)
    setPage(1)
  }

  const columns: DataTableColumn<Seller>[] = [
    {
      key: "name",
      header: "Seller",
      cell: (s) => (
        <Link
          href={`/admin/sellers/${s.id}`}
          className="group/link flex items-center gap-2 outline-none"
        >
          <span className="text-base">{s.flag}</span>
          <div>
            <div className="font-bold text-slate-900 underline-offset-4 group-hover/link:text-emerald-700 group-hover/link:underline">
              {s.name}
            </div>
            <div className="text-[11px] text-slate-400">{s.region}</div>
          </div>
        </Link>
      ),
    },
    {
      key: "kind",
      header: "Type",
      cell: (s) => <SellerKindPill isSettlementConduit={s.isSettlementConduit} />,
    },
    {
      key: "contact",
      header: "Contact",
      cell: (s) => <span className="text-slate-600">{s.contact || "—"}</span>,
      hideBelow: "lg",
    },
    {
      key: "balance",
      header: "Balance Owed",
      align: "right",
      cell: (s) =>
        s.isSettlementConduit ? (
          <Bdt value={nazmulDue} className="font-semibold" />
        ) : (
          <Usdt value={sellerUsdtDues[s.id] ?? 0} className="font-semibold" />
        ),
    },
    {
      key: "status",
      header: "Status",
      cell: (s) => <ActivePill active={s.active} />,
    },
    {
      key: "created",
      header: "Added",
      cell: (s) => shortDate(s.created_at),
      hideBelow: "xl",
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (s) => (
        <RowActions
          disabled={!canManage}
          onEdit={() => setEditTarget(s)}
          onDelete={
            s.isSettlementConduit ? undefined : () => setDeleteTarget(s)
          }
          extraActions={[
            {
              label: "View Details",
              icon: Eye,
              onSelect: () => router.push(`/admin/sellers/${s.id}`),
            },
            ...(isOwner && !s.isSettlementConduit
              ? [
                  {
                    label: "Set as Settlement Conduit",
                    icon: ShieldCheck,
                    onSelect: () => setConduitTarget(s),
                  },
                ]
              : []),
          ]}
        />
      ),
    },
  ]

  return (
    <>
      <SectionCard
        title="Seller / Sourcing Desk Directory"
        subtitle={`${data?.meta.totalCount ?? 0} seller(s) in the directory`}
        action={
          canManage ? (
            <Button size="sm" onClick={() => setAddOpen(true)} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Add Seller
            </Button>
          ) : undefined
        }
      >
        <div className="mb-4">
          <SellersFilters value={filters} onChange={handleFiltersChange} />
        </div>
        <div className={isFetching && !isPending ? "opacity-60 transition-opacity" : undefined}>
          <DataTable
            columns={columns}
            data={sellers}
            rowKey={(s) => s.id}
            entityLabel="sellers"
            isLoading={isPending}
            pagination={toDataTablePagination(data?.meta)}
            onPageChange={setPage}
            rowClassName={(s) => (s.active ? "" : "opacity-60")}
          />
        </div>
      </SectionCard>

      <AddSellerModal open={addOpen} onOpenChange={setAddOpen} mode="create" />

      <AddSellerModal
        open={editTarget !== null}
        onOpenChange={(open) => !open && setEditTarget(null)}
        mode="edit"
        initial={editTarget ?? undefined}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remove Seller"
        description={`Remove ${deleteTarget?.name ?? "this seller"}? If they have trade, rate, payment, or settlement history, they'll be deactivated instead of deleted so historical balances stay intact.`}
        destructive
        confirmLabel="Remove"
        onConfirm={async () => {
          if (!deleteTarget) return
          try {
            const result = await deleteSeller.mutateAsync(deleteTarget.id)
            toast.success(result.message ?? `${deleteTarget.name} removed.`)
          } catch (error) {
            toast.error(getErrorMessage(error, "Failed to remove seller."))
          } finally {
            setDeleteTarget(null)
          }
        }}
      />

      <ConfirmDialog
        open={conduitTarget !== null}
        onOpenChange={(open) => !open && setConduitTarget(null)}
        title="Set Settlement Conduit"
        description={`Make ${conduitTarget?.name ?? "this seller"} the settlement conduit? ${
          sellers.find((s) => s.isSettlementConduit)
            ? `This replaces ${sellers.find((s) => s.isSettlementConduit)?.name} as the current conduit. `
            : ""
        }Card-seller USDT settlements and USDT rate entry are always made against the conduit seller.`}
        confirmLabel="Set as Conduit"
        onConfirm={async () => {
          if (!conduitTarget) return
          try {
            await setConduit.mutateAsync(conduitTarget.id)
            toast.success(`${conduitTarget.name} is now the settlement conduit.`)
          } catch (error) {
            toast.error(getErrorMessage(error, "Failed to set settlement conduit."))
          } finally {
            setConduitTarget(null)
          }
        }}
      />
    </>
  )
}
