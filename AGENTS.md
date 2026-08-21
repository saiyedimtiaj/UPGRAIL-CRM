<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project conventions — AdFund Global CRM

See [USAGE.md](USAGE.md) for the full user-facing flow, screen-by-screen
functionality, the CRUD matrix, and delete semantics. This section is for
whoever edits the code.

## Stack

- Next.js App Router, React, TypeScript strict mode, pnpm.
- **`@base-ui/react`**, not Radix — the shadcn style is `base-nova`. Use
  `pnpm dlx shadcn@4.18.0 add <name>` to install new components; the local
  CLI auto-resolves the registry's `IconPlaceholder` references to plain
  `lucide-react` imports.
- **`motion` v13**, imported as `motion/react` — never `framer-motion`. The
  two packages must never coexist in this project.
- Tailwind CSS v4, CSS-first config via `@theme inline` in `app/globals.css`
  — no `tailwind.config.js`.
- Emerald-monochrome brand system: no multi-hue accent palette. Only
  emerald tones (`--color-brand-*`) for brand surfaces, slate/zinc
  neutrals, and semantic amber/rose/blue for status. Don't introduce a new
  accent color without a genuine semantic reason (warning/error/info).

## File organization

Route-colocated `_ui/`, not centralized `components/<feature>/`:

- `app/(admin)/admin/<route>/_ui/*.tsx` — anything used by exactly one
  route. This is the default location for new components.
- `components/shared/` — anything used by **two or more** routes (verify
  with a grep before adding here, not by guessing). Currently: `data-table`,
  `row-actions`, `alert`, `empty-state`, `add-client-modal`,
  `add-seller-modal`, `log-payment-modal`.
- `components/primitives/` — generic reusable UI atoms with no domain
  knowledge (Modal, ConfirmDialog, StatusBadge, Money formatters, the
  searchable comboboxes, SectionCard).
- `components/ui/` — shadcn-generated primitives only. Don't hand-edit
  beyond what the CLI produces except for small, documented additions (e.g.
  the `loading` prop on `Button`).
- `components/layout/` — app-wide chrome (sidebar, topbar, auth gate,
  skeleton). Rendered once in the `(admin)` route group layout, never
  duplicated per-page.

When a component currently in `_ui/` gains a second consumer, move it to
`components/shared/` rather than duplicating it.

## State

**No global state library, no reducer, no localStorage.** All app data lives
in one plain React Context: `lib/data/app-data.tsx`'s `AppDataProvider`,
holding a single `useState<PersistedState>` seeded once from
`lib/data/seed.ts`. Every mutator (`addX`/`editX`/`deleteX`) follows the same
shape:

```tsx
const addThing = React.useCallback((data) => {
  setState((s) => {
    // ...compute the new record / updated list...
    const auditLogs = [makeAuditEntry({ ... }), ...s.auditLogs]
    return { ...s, things: [...s.things, newThing], auditLogs }
  })
}, [currentUser])
```

Data resets to seed on every hard page reload by design — this is not a bug
to "fix" by adding persistence. Client-side `<Link>` navigation preserves
state within a session because it's all one Context; a `page.goto()` in
tests (or a browser refresh) does not.

**Audit-every-mutation is structural, not a convention.** Every
create/edit/delete/void anywhere in the app must append a `makeAuditEntry`
call inside the same `setState` updater that makes the change. If you add a
new mutator, add its audit entry in the same commit.

## Delete semantics

- **Client / Seller**: soft-deactivate (`active: false`) if referenced by
  any transaction/payment/settlement; hard-delete if orphaned. Check
  references before writing the confirm-dialog copy — see `deleteClient`/
  `deleteSeller` in `lib/data/app-data.tsx` for the reference query. The
  Nazmul conduit seller (`NAZMUL_SELLER_ID`) can never be deleted, soft or
  hard — `deleteSeller` early-returns for it.
- **Trade**: never hard-deleted once `finalized` — only `voidTransaction`
  (role-gated, requires a reason, keeps the row with a `VOIDED` badge). A
  still-`pending` trade (no committed profit/balance impact) may be
  hard-deleted via `deleteTransaction`.
- **Rate**: hard-delete via `deleteRate`, which reverts any trade that
  depended on it back to `pending` and re-runs `runAutoFinalization` against
  the reduced rate sheet before returning. Never delete a rate with a plain
  `filter()` — always go through this mutator.
- **Payment / USDT Settlement / Withdrawal**: always hard-delete, simple
  confirm.
- **User**: hard-delete via `deleteUser`, which refuses (returns state
  unchanged) if the target is the last remaining `role: "owner"`. Gate the
  delete UI on this too (see `TeamManagementCard`) rather than relying on
  the silent no-op.

## Tables

Every list in the app renders through `components/shared/data-table.tsx`
(default export `DataTable<T>`, prop `data` not `rows`, `emptyState` as a
`ReactNode` not a string). Do not reach for
`components/primitives/data-table.tsx` — it was deleted once every
consumer migrated to the shared one; don't recreate it. Give an editable
table's actions column a `components/shared/row-actions.tsx` `<RowActions>`
cell (`⋯` → Edit / Delete, or `extraActions` for anything beyond that
pair), gated on `disabled={!canManage}` where `canManage` checks
`currentUser.role === "owner" || currentUser.role === "partner"`.

## Testing changes live

There's no test suite — verify with a real browser (Playwright) against
`pnpm dev`. Two navigation methods behave differently and this matters for
this no-persistence app: `page.goto()` is a full reload and correctly
resets in-memory state to seed; clicking a real `<a>`/`<Link>` is Next.js
client-side navigation and correctly preserves state. Don't use `page.goto()`
mid-test to move between authenticated pages — it will silently sign you
back out.
