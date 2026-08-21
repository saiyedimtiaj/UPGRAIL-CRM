"use client"

import type { Seller } from "@/lib/types"
import { SearchableSelect } from "@/components/primitives/searchable-select"

interface SellerComboboxProps {
  sellers: Seller[]
  value: number | undefined
  onChange: (value: number) => void
  placeholder?: string
  disabled?: boolean
  id?: string
  className?: string
}

export function SellerCombobox({
  sellers,
  value,
  onChange,
  placeholder = "Select seller...",
  disabled,
  id,
  className,
}: SellerComboboxProps) {
  return (
    <SearchableSelect
      id={id}
      className={className}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      searchPlaceholder="Search sourcing desks..."
      emptyMessage="No matching sellers."
      options={sellers.map((s) => ({
        value: s.id,
        label: s.isSettlementConduit
          ? `${s.flag} ${s.name} [Settlement Conduit]`
          : `${s.flag} ${s.name}`,
        sublabel: s.region,
      }))}
    />
  )
}
