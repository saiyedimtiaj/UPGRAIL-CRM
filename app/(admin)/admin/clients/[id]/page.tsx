import { ClientDetail } from "./_ui/client-detail"

export const metadata = { title: "Client Details" }

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <div className="w-full space-y-5 p-4 sm:space-y-6 sm:p-6">
      <ClientDetail id={Number(id)} />
    </div>
  )
}
