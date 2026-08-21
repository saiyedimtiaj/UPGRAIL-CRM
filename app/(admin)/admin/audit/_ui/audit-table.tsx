import { shortDateTime } from "@/lib/date"
import { initials } from "@/lib/format"
import { SectionCard } from "@/components/primitives/section-card"
import DataTable, {
  type DataTableColumn,
} from "@/components/shared/data-table"
import { ActionBadge } from "@/components/primitives/action-badge"
import type { AuditLogEntry, PaginatedResponse } from "@/lib/types"
import { toDataTablePagination } from "@/lib/pagination"

export function AuditTable({
  entries,
  meta,
  isLoading,
  isFetching,
  onPageChange,
}: {
  entries: AuditLogEntry[]
  meta?: PaginatedResponse<AuditLogEntry>["meta"]
  isLoading?: boolean
  isFetching?: boolean
  onPageChange?: (page: number) => void
}) {
  const columns: DataTableColumn<AuditLogEntry>[] = [
    {
      key: "timestamp",
      header: "Timestamp / ID",
      cell: (e) => (
        <div>
          <div className="font-semibold text-slate-700">
            {shortDateTime(e.timestamp)}
          </div>
          <div className="font-mono text-[10px] text-slate-400">{e.id}</div>
        </div>
      ),
    },
    {
      key: "user",
      header: "User",
      cell: (e) => (
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 font-mono text-[10px] font-bold text-emerald-700">
            {initials(e.user_name)}
          </div>
          <span className="font-semibold text-slate-700">{e.user_name}</span>
        </div>
      ),
    },
    {
      key: "action",
      header: "Action Type",
      cell: (e) => <ActionBadge action={e.action} />,
    },
    {
      key: "target",
      header: "Target Entity",
      cell: (e) => (
        <span className="font-mono text-[11px] text-slate-600">
          {e.entity_type} ({e.entity_id})
        </span>
      ),
    },
    {
      key: "value",
      header: "Value / Impact",
      cell: (e) => (
        <div className="max-w-xs">
          {e.before_value && (
            <div className="text-[11px] text-slate-400 line-through">
              Before: {e.before_value}
            </div>
          )}
          <div className="text-xs font-semibold text-slate-700">
            {e.after_value}
          </div>
        </div>
      ),
    },
    {
      key: "reason",
      header: "Reason / Context",
      cell: (e) => (
        <span className="max-w-xs text-slate-500">{e.reason ?? "—"}</span>
      ),
    },
  ]

  return (
    <SectionCard
      title="System Audit Trail"
      subtitle={`${meta?.totalCount ?? 0} immutable entries — every rate change, creation, and void`}
    >
      {/* isFetching (not isLoading): dims during refetch instead of a skeleton flash. */}
      <div className={isFetching && !isLoading ? "opacity-60 transition-opacity" : undefined}>
        <DataTable
          columns={columns}
          data={entries}
          rowKey={(e) => e.id}
          entityLabel="audit entries"
          isLoading={isLoading}
          pagination={toDataTablePagination(meta)}
          onPageChange={onPageChange}
        />
      </div>
    </SectionCard>
  )
}
