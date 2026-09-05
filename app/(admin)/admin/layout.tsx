import { RouteGuard } from "@/components/shared/route-guard"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <RouteGuard>{children}</RouteGuard>
}
