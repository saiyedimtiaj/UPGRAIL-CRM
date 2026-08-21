import type { DataTablePagination } from "@/components/shared/data-table"
import type { PaginatedResponse } from "@/lib/types"

/** API's `meta` uses totalCount/currentPage; DataTable expects total/page. */
export function toDataTablePagination(
  meta: PaginatedResponse<unknown>["meta"] | undefined,
): DataTablePagination | undefined {
  if (!meta) return undefined
  return {
    page: meta.currentPage,
    totalPages: meta.totalPages,
    total: meta.totalCount,
    limit: meta.limit,
  }
}

export const PAGE_SIZE = 25
