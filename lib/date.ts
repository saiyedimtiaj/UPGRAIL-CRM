/** Local-calendar YYYY-MM-DD. Not `toISOString()`, which is UTC-based and
 *  reports the previous day for UTC+6 users before 6am local. */
export function todayISO(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function isoDaysAgo(n: number, anchorISO: string): string {
  const [y, m, d] = anchorISO.split("-").map(Number)
  const anchor = new Date(y, m - 1, d)
  anchor.setDate(anchor.getDate() - n)
  return todayISO(anchor)
}

/** Shown wherever a date is absent or unparseable, rather than leaking
 *  "Invalid Date" (or throwing) into the UI. */
const NO_DATE = "—"

/** Accepts both shapes the API emits: a bare calendar date ("2026-08-21",
 *  from the VarChar(10) `date` columns) and a full ISO timestamp
 *  ("2026-08-21T09:30:00.000Z", from every `*_at`/`timestamp` column).
 *  Parsed from the date part only, so the rendered day is the calendar day
 *  as stored — never shifted by the viewer's UTC offset. */
export function shortDate(iso: string | null | undefined): string {
  if (!iso) return NO_DATE
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number)
  const date = new Date(y, m - 1, d)
  if (Number.isNaN(date.getTime())) return NO_DATE
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function timeOnly(iso: string | null | undefined): string {
  if (!iso) return NO_DATE
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return NO_DATE
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

export function shortDateTime(iso: string | null | undefined): string {
  if (!iso) return NO_DATE
  return `${shortDate(iso)}, ${timeOnly(iso)}`
}
