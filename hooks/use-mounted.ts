"use client"

import * as React from "react"

const subscribe = () => () => {}

/** useSyncExternalStore instead of useEffect+setState: server snapshot is
 *  always false, client always true, so React handles the re-render itself. */
export function useMounted(): boolean {
  return React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
}
