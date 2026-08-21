"use client"

import * as React from "react"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import EmptyState from "@/components/shared/empty-state"

export interface DataTableColumn<T> {
  key: string
  header: string | React.ReactNode
  cell: (row: T) => React.ReactNode
  sortField?: string

  hideBelow?: "sm" | "md" | "lg" | "xl" | "2xl"
  align?: "left" | "center" | "right"
  headerClassName?: string
  cellClassName?: string
  skeletonWidth?: string
}

export interface DataTablePagination {
  page: number
  totalPages: number
  total: number
  limit: number
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  rowKey: (row: T) => string | number
  onPageChange?: (page: number) => void
  onSort?: (field: string) => void
  sortBy?: string
  sortOrder?: "asc" | "desc"
  pagination?: DataTablePagination
  isLoading?: boolean
  skeletonRows?: number
  emptyState?: React.ReactNode
  entityLabel?: string

  mobileCard?: (row: T) => React.ReactNode
  rowClassName?: (row: T) => string
  footerLeft?: React.ReactNode
  selectable?: boolean
  selectedKeys?: Set<string | number>
  onToggleRow?: (key: string | number) => void
  onToggleAll?: () => void
}

const breakpointHidden: Record<string, string> = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell",
  "2xl": "hidden 2xl:table-cell",
}

function SortIcon({
  field,
  sortBy,
  sortOrder,
}: {
  field: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}) {
  if (sortBy !== field)
    return (
      <ArrowUpDown className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover/th:opacity-40" />
    )
  return sortOrder === "asc" ? (
    <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
  ) : (
    <ArrowDown className="h-3.5 w-3.5 text-emerald-600" />
  )
}

function TableSkeleton<T>({
  columns,
  rows,
}: {
  columns: DataTableColumn<T>[]
  rows: number
}) {
  return (
    <div className="overflow-hidden rounded-card border border-zinc-200/90">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-100 bg-slate-50/60">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-5 py-3.5 text-left ${col.headerClassName ?? ""} ${
                    col.hideBelow ? breakpointHidden[col.hideBelow] : ""
                  }`}
                >
                  <Skeleton
                    className={`h-3.5 rounded ${col.skeletonWidth ?? "w-16"}`}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-5 py-4 ${col.hideBelow ? breakpointHidden[col.hideBelow] : ""}`}
                  >
                    <Skeleton
                      className={`h-4 rounded ${col.skeletonWidth ?? "w-20"}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PaginationText({
  pageStart,
  pageEnd,
  total,
  entityLabel,
}: {
  pageStart: number
  pageEnd: number
  total: number
  entityLabel: string
}) {
  return (
    <p className="text-sm text-slate-500">
      Showing <span className="font-semibold text-slate-900">{pageStart}</span>{" "}
      to <span className="font-semibold text-slate-900">{pageEnd}</span> of{" "}
      <span className="font-semibold text-slate-900">{total}</span>{" "}
      {entityLabel}
    </p>
  )
}

function TablePagination({
  pagination,
  entityLabel,
  onPageChange,
  footerLeft,
}: {
  pagination: DataTablePagination
  entityLabel: string
  onPageChange?: (page: number) => void
  footerLeft?: React.ReactNode
}) {
  const { page, totalPages, total, limit } = pagination
  const pageStart = (page - 1) * limit + 1
  const pageEnd = Math.min(page * limit, total)

  return (
    <div className="flex flex-col gap-3 border-t border-zinc-100 bg-slate-50/40 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        {footerLeft}
        <PaginationText
          pageStart={pageStart}
          pageEnd={pageEnd}
          total={total}
          entityLabel={entityLabel}
        />
      </div>
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={page <= 1}
            onClick={() => onPageChange?.(1)}
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={page <= 1}
            onClick={() => onPageChange?.(page - 1)}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          {(() => {
            const pages: (number | "ellipsis")[] = []
            if (totalPages <= 5) {
              for (let i = 1; i <= totalPages; i++) pages.push(i)
            } else {
              pages.push(1)
              if (page > 3) pages.push("ellipsis")
              const start = Math.max(2, page - 1)
              const end = Math.min(totalPages - 1, page + 1)
              for (let i = start; i <= end; i++) pages.push(i)
              if (page < totalPages - 2) pages.push("ellipsis")
              pages.push(totalPages)
            }
            return pages.map((p, idx) =>
              p === "ellipsis" ? (
                <span
                  key={`dots-${idx}`}
                  className="flex h-8 w-8 items-center justify-center text-xs text-slate-400 select-none"
                >
                  …
                </span>
              ) : (
                <Button
                  key={p}
                  variant={page === p ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0 text-xs"
                  onClick={() => onPageChange?.(p)}
                >
                  {p}
                </Button>
              )
            )
          })()}
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={page >= totalPages}
            onClick={() => onPageChange?.(page + 1)}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={page >= totalPages}
            onClick={() => onPageChange?.(totalPages)}
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  )
}

export default function DataTable<T>({
  columns,
  data,
  rowKey,
  onPageChange,
  onSort,
  sortBy,
  sortOrder,
  pagination,
  isLoading,
  skeletonRows = 6,
  emptyState,
  entityLabel = "items",
  mobileCard,
  rowClassName,
  footerLeft,
  selectable,
  selectedKeys,
  onToggleRow,
  onToggleAll,
}: DataTableProps<T>) {
  const alignClass = (a?: "left" | "center" | "right") =>
    a === "right" ? "text-right" : a === "center" ? "text-center" : "text-left"
  const isAllSelected =
    selectable &&
    data.length > 0 &&
    data.every((row) => selectedKeys?.has(rowKey(row)))

  if (isLoading) {
    return <TableSkeleton columns={columns} rows={skeletonRows} />
  }

  if (!data || data.length === 0) {
    const fallback = (
      <EmptyState
        title={`No ${entityLabel} found`}
        description={`No ${entityLabel} have been added yet.`}
        size="lg"
      />
    )

    return (
      <div className="overflow-hidden rounded-card border border-zinc-200/90">
        <div
          className={`${mobileCard ? "hidden md:block" : ""} overflow-x-auto`}
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100 bg-slate-50/60">
                {columns.map((col) => {
                  const vis = col.hideBelow
                    ? breakpointHidden[col.hideBelow]
                    : ""
                  const align = alignClass(col.align)
                  return (
                    <th
                      key={col.key}
                      className={`px-5 py-3.5 ${align} ${vis} ${col.headerClassName ?? ""}`}
                    >
                      {col.sortField ? (
                        <button className="group/th flex cursor-default items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-400 uppercase">
                          {col.header}
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-20" />
                        </button>
                      ) : typeof col.header === "string" ? (
                        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                          {col.header}
                        </span>
                      ) : (
                        col.header
                      )}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={columns.length}>{emptyState ?? fallback}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="md:hidden">{emptyState ?? fallback}</div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-card border border-zinc-200/90">
      {mobileCard && (
        <div className="divide-y divide-zinc-100 md:hidden">
          {data.map((row) => (
            <React.Fragment key={rowKey(row)}>
              {mobileCard(row)}
            </React.Fragment>
          ))}
        </div>
      )}

      <div
        className={`${mobileCard ? "hidden md:block" : ""} overflow-x-auto`}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-slate-50/60">
              {selectable && (
                <th className="w-10 px-5 py-3.5">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={() => onToggleAll?.()}
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map((col) => {
                const vis = col.hideBelow
                  ? breakpointHidden[col.hideBelow]
                  : ""
                const align = alignClass(col.align)
                return (
                  <th
                    key={col.key}
                    className={`px-5 py-3.5 ${align} ${vis} ${col.headerClassName ?? ""}`}
                  >
                    {col.sortField && onSort ? (
                      <button
                        onClick={() => onSort(col.sortField!)}
                        className="group/th flex cursor-pointer items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-400 uppercase transition-colors hover:text-slate-700"
                      >
                        {col.header}
                        <SortIcon
                          field={col.sortField}
                          sortBy={sortBy}
                          sortOrder={sortOrder}
                        />
                      </button>
                    ) : typeof col.header === "string" ? (
                      <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                        {col.header}
                      </span>
                    ) : (
                      col.header
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100">
            {data?.map((row) => (
              <tr
                key={rowKey(row)}
                className={`group transition-colors hover:bg-slate-50/80 ${rowClassName?.(row) ?? ""}`}
              >
                {selectable && (
                  <td className="w-10 px-5 py-3.5">
                    <Checkbox
                      checked={selectedKeys?.has(rowKey(row)) ?? false}
                      onCheckedChange={() => onToggleRow?.(rowKey(row))}
                      aria-label="Select row"
                    />
                  </td>
                )}
                {columns.map((col) => {
                  const vis = col.hideBelow
                    ? breakpointHidden[col.hideBelow]
                    : ""
                  const align = alignClass(col.align)
                  return (
                    <td
                      key={col.key}
                      className={`px-5 py-3.5 ${align} ${vis} ${col.cellClassName ?? ""}`}
                    >
                      {col.cell(row)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && data.length > 0 && (
        <TablePagination
          pagination={pagination}
          entityLabel={entityLabel}
          onPageChange={onPageChange}
          footerLeft={footerLeft}
        />
      )}
    </div>
  )
}
