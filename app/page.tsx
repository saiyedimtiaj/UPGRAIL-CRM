import { redirect } from "next/navigation"

// Root URL has no content of its own; AuthGate in the (admin) layout handles
// redirecting unauthenticated visitors to /sign-in.
export default function RootPage() {
  redirect("/admin")
}
