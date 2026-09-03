import * as React from "react"

import { TransactionsView } from "./_ui/transactions-view"

export default function TransactionsPage() {
  return (
    <React.Suspense fallback={null}>
      <TransactionsView />
    </React.Suspense>
  )
}
