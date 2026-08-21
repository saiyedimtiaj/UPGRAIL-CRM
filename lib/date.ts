
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

const NO_DATE = "—"

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
