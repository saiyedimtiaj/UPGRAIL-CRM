import { SellerDetail } from "./_ui/seller-detail"

export const metadata = { title: "Seller Details" }

export default async function SellerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <div className="w-full space-y-5 p-4 sm:space-y-6 sm:p-6">
      <SellerDetail id={Number(id)} />
    </div>
  )
}
