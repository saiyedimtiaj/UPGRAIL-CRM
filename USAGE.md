# AdFund Global CRM — Usage Guide

A Next.js CRM for an ad-funding / FX sourcing desk: it tracks USD trades bought
from sourcing sellers and sold to ad-agency clients, in BDT and USDT, with a
signature auto-finalization engine and a full audit trail. This document
explains how to run it and how every screen works.

---

## Running it

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

Other scripts: `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm start`.

**There is no backend and no database.** All data lives in memory, in one
React Context (`lib/data/app-data.tsx`), seeded fresh from
`lib/data/seed.ts` on every page load. This means:

- Everything you create, edit, or delete is real and flows live to every
  other screen — a trade logged on Trades shows up instantly on the
  Dashboard, the Client Ledger, Reconciliation, and the Audit Trail.
- **Refreshing the page resets everything back to the seed data.** This is
  intentional, not a bug — the app has no persistence layer by design.
  Client-side navigation (clicking a sidebar link) does *not* reset state;
  only a hard reload does.

---

## Signing in

`/sign-in` offers three demo accounts — click any card to sign in as that
role, no password needed:

| Name | Role | Can do |
| --- | --- | --- |
| Nazmul Hasan | `owner` | Everything, including voiding trades, deleting/deactivating parties, managing the team, and seeing profit. |
| Rahim Chowdhury | `partner` | Same operational powers as owner (edit/delete/void/manage team), sees profit. |
| Karim Ahmed | `staff` | Can log trades, rates, payments, and settlements, but cannot edit/delete/void anything, cannot manage the team, and cannot see profit figures unless an owner/partner flips his visibility toggle in Settings. |

Signing out (or reloading) drops you back to `/sign-in`. `AuthGate`
(`components/layout/auth-gate.tsx`) redirects any unauthenticated visit to
`/admin/*` back to sign-in, and redirects an already-signed-in visit to
`/sign-in` forward to `/admin`.

---

## The domain model, in one paragraph

The business buys USD from **sellers** and sells it to **clients**, in BDT.
Sellers are one of two archetypes: **direct** sellers quote a BDT/USD spot
rate and get paid in BDT; **card** sellers quote a percentage and get settled
in USDT via Nazmul, the single central settlement conduit
(`NAZMUL_SELLER_ID`). A **trade** (`Transaction`) can be logged before all its
rates are known — it sits `pending` — and the moment the last rate it needs is
entered on the Rates screen, it **auto-finalizes**: profit gets computed and
the trade flips to `finalized` retroactively, with no one touching it again.
Every mutation anywhere in the app — create, edit, delete, void, rate update,
payment, settlement, withdrawal — appends an entry to the immutable Audit
Trail.

---

## Screens

The sidebar is grouped into four sections:

### Operations
- **Dashboard** (`/admin`) — KPI row (receivables, payables, profit pool,
  pending volume), a volume/spread chart, the real seller sourcing breakdown
  (derived from actual seller + trade data, not fixtures), and a settlement
  hubs map.
- **Quick Entry / Trades** (`/admin/trades`) — the fast trade-logging form
  plus today's trade ledger. Rows: Edit (USD amount/notes) · Void (owner/
  partner only, requires a written reason, never deletes — see below) ·
  Delete (only while still `pending`, since a pending trade has no profit or
  balance impact committed yet).
- **Daily Rate Engine** (`/admin/rates`) — enter today's (or any date's)
  client/seller/USDT rates. Saving a rate **re-runs auto-finalization** across
  every pending trade and settlement for that date — this is the trigger
  point for the app's signature behavior. A "Pre-fill Yesterday's Rates"
  button copies the prior day's full rate sheet forward.
- **Rate History** (`/admin/rate-history`) — the full log of every rate ever
  entered, across every date, with Edit and Delete. Deleting a rate reverts
  any trade that depended on it back to `pending` and re-runs
  auto-finalization against the reduced rate sheet, so numbers never go
  stale.

### Directory
- **Clients** (`/admin/clients`) — full client directory: Add, Edit, and
  smart Delete (see below). Shows each client's live receivable balance.
- **Sellers** (`/admin/sellers`) — same, for sourcing sellers. The Nazmul
  conduit seller can be edited but never deleted (its delete action is
  hidden).

### Finance
- **Client Ledgers** (`/admin/client-ledger`) — pick a client, see their
  full merged trade + payment statement and running balance. Payments in
  the timeline can be edited/deleted inline.
- **Seller Ledgers** (`/admin/seller-ledger`) — same for sellers, branching
  by archetype: direct sellers get "Log BDT Payment", card sellers get
  "Log USDT Settlement (§8.5)". Payments and settlements are editable/
  deletable inline.
- **Payments** (`/admin/payments`) — the full payment log across *every*
  client and direct seller in one table, with Add/Edit/Delete. This is the
  only place to log a payment without first picking a party from a ledger.
- **USDT Settlements** (`/admin/settlements`) — log USDT fronted to a card
  seller by Nazmul, plus the full historical log with Edit/Delete.
- **Profit & Pool** (`/admin/profit`) — the withdrawable profit pool
  (finalized trade profit minus withdrawals), a liquidity warning if the
  pool can't cover outstanding payables, and withdrawal history with Edit/
  Delete. Hidden from staff unless their profit-visibility toggle is on.
- **Reconciliation** (`/admin/reconciliation`) — Nazmul's 3-pillar
  reconciliation: direct sales, fronted USDT settlements (in USDT and BDT),
  and the resulting balance owed to/by Nazmul.

### System
- **Reports / CSV** (`/admin/reports`) — filter trades by date range/status/
  party and export. Read-only by design (it's a report, not a record).
- **Audit Trail** (`/admin/audit`) — the immutable log of every create,
  edit, delete, void, rate update, payment, and withdrawal in the app, with
  before/after values and the acting user. Never editable — that's the
  point of an audit trail.
- **Settings** (`/admin/settings`) — the demo role switcher, the staff
  profit-visibility toggle, **Team Management** (Add/Edit/Delete team
  member accounts — owner-only, and the last remaining owner account can't
  be deleted), and the in-memory data status card (with a "Reset Demo Data"
  action).

---

## CRUD matrix

Every entity in the app can be created, edited, and deleted/deactivated —
there is no read-only, no-way-to-fix-a-mistake surface left, except the
Audit Trail and Reports, which are read-only by design.

| Entity | Create | Edit | Delete |
| --- | --- | --- | --- |
| Trade | Trades page | USD amount, notes | Void (finalized) or hard-delete (pending only) |
| Rate | Rates page | Rate History | Rate History (re-runs auto-finalization) |
| Client | Clients page / Trades "+ Add" | Clients page | Smart (see below) |
| Seller | Sellers page / Trades "+ Add" | Sellers page | Smart (see below); Nazmul conduit exempt |
| Payment | Payments page / a ledger | Payments page / a ledger | Payments page / a ledger |
| USDT Settlement | Settlements page / Seller Ledger | Settlements page | Settlements page / Seller Ledger |
| Withdrawal | Profit page | Withdrawal History | Withdrawal History |
| Team member (User) | Settings → Team Management | Settings → Team Management | Settings → Team Management (last owner protected) |

### Smart delete semantics

Clients and Sellers use **soft delete when referenced, hard delete when
orphaned**:

- If a client/seller has any trade, payment, or settlement history, deleting
  them **deactivates** the record (`active: false`) instead of removing it.
  They disappear from every picker/combobox, but their historical trades,
  balances, and ledger entries stay exactly as they were — deleting a
  referenced party would otherwise orphan transactions and corrupt every
  balance calculation.
- If they have zero history, deleting them **removes the record outright**.

Trades never follow this rule — a `finalized` trade can only be **voided**
(role-gated, requires a written reason, shows struck-through with a
`VOIDED` badge, and is kept forever for the audit trail). A trade that's
still `pending` (no profit or balance impact has been committed yet) can be
hard-deleted.

Payments, settlements, and withdrawals are point-in-time cash movements, not
party records — they always hard-delete, with a confirmation prompt.

---

## Role gating

`owner` and `partner` share the same operational permissions: both can
edit/delete/void anything and manage the team. `staff` can create records
(trades, rates, payments, settlements) but every Edit/Delete/Void action is
hidden for them, and they can't reach Team Management. Profit figures
(Profit & Pool page, and profit columns elsewhere) are hidden from staff
unless an owner/partner turns on that specific staff member's visibility
toggle in Settings.

---

## Architecture notes (for developers)

- **State**: one plain React Context (`lib/data/app-data.tsx`) over
  `useState` — no reducer, no localStorage, no SSR/hydration gating. Every
  mutator follows the same shape: compute the change, append a
  `makeAuditEntry(...)` to `auditLogs`, return the new state.
- **Structure**: route-colocated `_ui/` folders
  (`app/(admin)/admin/<route>/_ui/*.tsx`) for anything used by one route;
  `components/shared/` for anything used by two or more routes (e.g.
  `DataTable`, `RowActions`, `Alert`, `EmptyState`, the Add/Log modals shared
  between Trades and the ledgers); `components/primitives/` for generic
  reusable UI atoms (Modal, ConfirmDialog, StatusBadge, Money formatters,
  the searchable comboboxes); `components/ui/` for shadcn-generated
  primitives; `components/layout/` for app-wide chrome (sidebar, topbar,
  auth gate).
- **Tables**: every list in the app renders through the one shared
  `components/shared/data-table.tsx` — sortable headers, pagination,
  skeleton loading, per-column responsive hiding, optional mobile card
  fallback, bulk-select. Row actions use the shared
  `components/shared/row-actions.tsx` "⋯" menu (Edit / Delete, or custom
  extra actions).
- **Auto-finalization**: the pure math lives in `lib/domain/finalization.ts`
  and `lib/domain/balances.ts` — framework-free functions called from the
  Context's mutators, never re-implemented inline.
- **Audit-every-mutation**: every create/edit/delete/void anywhere in the
  app appends a `makeAuditEntry` call in the same function that makes the
  change — not a convention, a structural requirement.
