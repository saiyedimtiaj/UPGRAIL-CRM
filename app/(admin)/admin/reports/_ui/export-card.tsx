"use client"

import { Download, FileSpreadsheet } from "lucide-react"
import { toast } from "sonner"

import type { Client, Seller, Transaction } from "@/lib/types"
import { toCSV, downloadCSV } from "@/lib/csv"
import { useActiveClients } from "@/features/use-clients"
import { useActiveSellers } from "@/features/use-sellers"
import { useConfetti } from "@/hooks/use-confetti"
import { SectionCard } from "@/components/primitives/section-card"
import { Button } from "@/components/ui/button"

interface ExportCardProps {
  trades: Transaction[]
}


export function ExportCard({ trades }: ExportCardProps) {
  const { data: clients = [] } = useActiveClients()
  const { data: sellers = [] } = useActiveSellers()
  const fireConfetti = useConfetti()

  function exportTrades() {
    const rows = trades.map((t) => {
      const client = t.client ?? clients.find((c) => c.id === t.client_id)
      const seller = t.seller ?? sellers.find((s) => s.id === t.seller_id)
      return [
        t.date,
        t.id,
        client?.name ?? t.client_id,
        seller?.name ?? t.seller_id,
        t.usd_amount,
        t.sell_bdt ?? "",
        t.actual_buy_bdt ?? "",
        t.profit ?? "",
        t.client_charge_status,
        t.profit_status,
      ]
    })
    const csv = toCSV(
      [
        "Date",
        "Trade ID",
        "Client",
        "Seller",
        "USD Amount",
        "Sell BDT",
        "Actual Buy BDT",
        "Profit BDT",
        "Client Charge Status",
        "Profit Status",
      ],
      rows
    )
    downloadCSV(csv, `trades-${new Date().toISOString().slice(0, 10)}.csv`)
    fireConfetti()
    toast.success("Trades CSV exported.")
  }

  function exportClients(clients: Client[]) {
    const rows = clients.map((c) => [
      c.id,
      c.name,
      c.company,
      c.contact,
      c.region,
      c.created_at,
    ])
    const csv = toCSV(
      ["ID", "Name", "Company", "Contact", "Region", "Created"],
      rows
    )
    downloadCSV(csv, `clients-${new Date().toISOString().slice(0, 10)}.csv`)
    fireConfetti()
    toast.success("Clients CSV exported.")
  }

  function exportSellers(sellers: Seller[]) {
    const rows = sellers.map((s) => [
      s.id,
      s.name,
      s.isSettlementConduit ? "Settlement Conduit" : "External",
      s.region,
      s.contact,
      s.created_at,
    ])
    const csv = toCSV(
      ["ID", "Name", "Type", "Region", "Contact", "Created"],
      rows
    )
    downloadCSV(csv, `sellers-${new Date().toISOString().slice(0, 10)}.csv`)
    fireConfetti()
    toast.success("Sellers CSV exported.")
  }

  return (
    <SectionCard
      title="1-Click CSV Exports"
      subtitle="Download filtered data as a spreadsheet — everything stays in your browser"
      action={
        <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 sm:flex">
          <FileSpreadsheet className="h-4 w-4" />
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Button
          variant="outline"
          className="justify-start gap-2"
          onClick={exportTrades}
        >
          <Download className="h-3.5 w-3.5" /> Trades ({trades.length})
        </Button>
        <Button
          variant="outline"
          className="justify-start gap-2"
          onClick={() => exportClients(clients)}
        >
          <Download className="h-3.5 w-3.5" /> Clients ({clients.length})
        </Button>
        <Button
          variant="outline"
          className="justify-start gap-2"
          onClick={() => exportSellers(sellers)}
        >
          <Download className="h-3.5 w-3.5" /> Sellers ({sellers.length})
        </Button>
      </div>
    </SectionCard>
  )
}
