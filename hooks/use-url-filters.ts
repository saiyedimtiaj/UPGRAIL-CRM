"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"

type FilterValue = string | number | boolean | undefined

/**
 * Filter state that lives in the query string.
 *
 * Keeping it in the URL rather than in component state means a filtered view
 * can be bookmarked and shared, survives a refresh, and responds to the back
 * button — all of which operators expect from a list they have just narrowed
 * down. Only non-empty values are written, so a cleared filter leaves no trace.
 */
export function useUrlFilters<T extends Record<string, FilterValue>>(empty: T) {
  const router = useRouter()
  const params = useSearchParams()
  // The query string itself is the dependency; the params object identity is
  // not stable across renders.
  const search = params.toString()

  // The URL is the source of truth. Deriving state from it on every render
  // (rather than copying it into useState) is what makes the back button work:
  // a history change re-renders with the previous filters already applied.
  const filters = React.useMemo(() => {
    const next = { ...empty }

    for (const key of Object.keys(empty) as (keyof T)[]) {
      const raw = params.get(String(key))
      if (raw === null) continue

      const fallback = empty[key]
      if (typeof fallback === "number") {
        const parsed = Number(raw)
        if (!Number.isNaN(parsed)) next[key] = parsed as T[keyof T]
      } else if (typeof fallback === "boolean") {
        next[key] = (raw === "true") as T[keyof T]
      } else {
        next[key] = raw as T[keyof T]
      }
    }

    return next
    // `empty` is a module-level constant at every call site; `search` is what
    // actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const write = React.useCallback(
    (next: T) => {
      const search = new URLSearchParams()

      for (const [key, value] of Object.entries(next)) {
        // An unset filter should not appear in the URL at all, so a cleared
        // form gives back a clean address.
        if (value === undefined || value === "" || value === null) continue
        // 0 is the "All" sentinel the select components use for an empty
        // choice, not a real id.
        if (typeof value === "number" && value === 0) continue
        if (value === false) continue
        search.set(key, String(value))
      }

      const qs = search.toString()
      router.replace(qs ? `?${qs}` : window.location.pathname, {
        scroll: false,
      })
    },
    [router]
  )

  const setFilters = React.useCallback(
    (update: T | ((prev: T) => T)) => {
      write(typeof update === "function" ? update(filters) : update)
    },
    [filters, write]
  )

  const reset = React.useCallback(() => write(empty), [write, empty])

  const isDirty = React.useMemo(
    () =>
      (Object.keys(empty) as (keyof T)[]).some(
        (key) => String(filters[key] ?? "") !== String(empty[key] ?? "")
      ),
    [filters, empty]
  )

  return { filters, setFilters, reset, isDirty }
}
