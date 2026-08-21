import { isAxiosError } from "axios"

export function getErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string | string[] }
      | undefined

    if (data?.message) {
      return Array.isArray(data.message) ? data.message.join(" ") : data.message
    }

    if (error.response) {
      return `${error.response.status} ${error.response.statusText}`
    }

    if (error.request) {
      return "No response received from the server."
    }

    return error.message || fallback
  }

  if (error instanceof Error) return error.message

  return fallback
}
