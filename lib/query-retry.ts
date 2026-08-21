import { isAxiosError } from "axios"

/** Never retry 4xx (client errors, including auth failures) — only retry
 *  once for network/5xx errors, since those may be transient. */
export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (isAxiosError(error)) {
    const status = error.response?.status
    if (status !== undefined && status >= 400 && status < 500) {
      return false
    }
  }
  return failureCount < 1
}
