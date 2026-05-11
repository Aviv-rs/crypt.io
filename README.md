# Crypt.io — Transactions

A single-page web app that renders a paginated, sortable, filterable view over a populated SQLite `Transactions` dataset (crypto transfers, swaps, fees across networks). One page (`/`), one dataset, dark-only theme.

The original assignment brief is preserved at the bottom of this file.

## Stack

| Layer       | Choice                                        |
| ----------- | --------------------------------------------- |
| Runtime     | Bun ≥ 1.3 (server, bundler, test runner)      |
| HTTP server | `Bun.serve()` with HTML imports               |
| Frontend    | React 19 + React Compiler                     |
| Routing     | TanStack Router (typed search params via Zod) |
| Client data | TanStack Query                                |
| Styling     | Tailwind CSS v4 + shadcn primitives           |
| Server data | Drizzle ORM + `bun:sqlite`                    |
| Validation  | Zod (shared client + server)                  |
| Spreadsheet | Hand-written RFC-4180 CSV writer (zero-dep)   |

## Getting started

```bash
bun install
bun run dev
```

Open <http://localhost:3000>. The committed `src/api/database/database.db` is used as-is — no migration or seeding needed.

```bash
bun run test       # csv writer + params parser tests
bun run typecheck  # TypeScript noEmit
```

## Architecture

Vertical-slice layout. Everything for a feature lives in one folder; Bun's bundler only ships what `frontend.tsx` transitively imports, so the `server/` subfolder stays out of the browser bundle (components never import server code; types cross via `import type`).

```
src/
  index.ts                       # Bun.serve route map only
  index.html, frontend.tsx, App.tsx
  router.tsx                     # TanStack Router config
  queryClient.ts                 # shared QueryClient (loader prefetch)
  api/database/                  # Drizzle client + schema + database.db
  components/                    # cross-feature: AppLayout, TopBar, NotFound, …
  components/ui/                 # shadcn primitives (read-only)
  features/transactions/
    transactions.types.ts        # zod schemas, types, defaults — one source of truth
    transactions.queries.ts      # TanStack Query options factory
    server/
      transactions.controller.ts # parses, queries Drizzle, responds; exports a routes map
      export-transactions-to-csv.ts # streaming CSV writer
    components/                  # TransactionsTable, FilterBar, ExportMenu, …
    utils/                       # formatters
  assets/styles/index.css        # design tokens + Tailwind layer config
```

### Server

- One controller per route, no hand-rolled service layer until logic justifies one.
- The controller exports `transactionsRoutes` keyed by path; `src/index.ts` spreads it into `Bun.serve`. Bun auto-405s methods not in the record.
- Request validation lives entirely in Zod. The list endpoint accepts a JSON-encoded `filters=[{key,value},…]` (zod `discriminatedUnion`), `sort`/`dir` from a typed allowlist, and clamps `pageSize` at 200. Parse errors return `400` with `issues`.
- Filtering uses SQL `LIKE %value%` — substring + ASCII case-insensitive on SQLite — so `Solana` matches `solana`.
- Stable paging: `ORDER BY <chosen>, id DESC` regardless of the user's sort.

### CSV export

`/api/transactions/export?scope=view|all&...` streams `text/csv` via `ReadableStream`, walking the matched set in 1k-row chunks. The dataset never sits in memory. The writer prepends a UTF-8 BOM so Excel / Numbers / LibreOffice detect encoding without a warning, and quotes any cell containing a comma, quote, CR, or LF.

### Client

- TanStack Router validates `validateSearch` with the same Zod schema the server uses; `?page=1&pageSize=50&sort=date&dir=desc&filters=[…]` is the canonical typed state.
- `stripSearchParams(TRANSACTIONS_SEARCH_DEFAULTS)` keeps the URL clean when values match defaults.
- The route loader runs `queryClient.prefetchQuery(transactionsQueryOptions(deps))` on every search change, so paging / filter / sort transitions arrive at a warm cache.
- `placeholderData: keepPreviousData` so the table doesn't flash empty between pages.

### UI

- Dark-only theme; tokens live as CSS variables in `src/assets/styles/index.css` and are bridged to Tailwind v4 via `@theme inline`. Components read tokens through utilities; no hardcoded colors.
- Aurora-style row layout (Type / Asset / Counterparty / Network / Fee / Date), method badge with leading icon, asset cell that merges buy/sell into a single arrow form for trades. Long currency strings (NFT IDs) are truncated with the full value on hover.
- Below `md` the table swaps to a stacked card list. Filter bar collapses behind a single Filters (n) button on mobile.
- Row click expands a detail panel (txHash, blockHeight, smart contract, comments, \*Token columns, full sender/receiver).
- Export menu offers "Current view" (sort + filters honored) and "Full dataset" (sort honored, filters ignored).

## Process

This project was built spec-driven. Before writing code I wrote down the product, the architecture, the tokens + UI conventions, the implementation rules, and an ordered build plan that breaks the work into small verifiable units. Each unit ends with a tracker entry that captures what landed and any reversed decisions (e.g. "no router in v1" → "TanStack Router after URL state grew") so the _why_ survives the diff.

The spec lives in [`context/`](./context):

- [`project-overview.md`](./context/project-overview.md) — product, goals, scope, success criteria
- [`architecture.md`](./context/architecture.md) — stack, system boundaries, invariants, API surface
- [`ui-context.md`](./context/ui-context.md) — theme, tokens, typography, layout patterns
- [`code-standards.md`](./context/code-standards.md) — implementation rules and conventions
- [`ai-workflow-rules.md`](./context/ai-workflow-rules.md) — workflow + scoping rules
- [`progress-tracker.md`](./context/progress-tracker.md) — build order, completed units, architecture decisions, open questions

`CLAUDE.md` and `.cursor/rules/` instruct AI tooling to read those files before suggesting code or proposing architecture changes — same context whether the next contributor opens Claude Code, Cursor, or just reads the docs themselves.

## Tests

`bun test` covers two boundaries:

- `transactions.types.test.ts` — Zod params parser: defaults, coercion, pageSize clamp, sort allowlist, filters JSON parsing, date coercion, error cases for malformed JSON and unknown keys.
- `export-transactions-to-csv.test.ts` — CSV writer escaping (commas, quotes, CR/LF, Date → ISO), UTF-8 BOM, CRLF line endings.

---

## Original assignment brief

Build a single-page application that renders crypto transaction data stored in the provided SQLite database.

### Required

- **Data table** — display crypto transactions in a tabular view on a single page.
- **Server-side pagination or infinite scroll** — data must be fetched in pages from the server.
- **Excel export** — current view or full dataset, **without third-party dependencies**.
- **Responsive layout** — usable on desktop and mobile viewports.

### Nice to have

- Column filtering.
- Column sorting.

### Provided starter

| Layer    | Technology                                      |
| -------- | ----------------------------------------------- |
| Runtime  | Bun                                             |
| Frontend | React 19, served via `Bun.serve()` HTML imports |
| Styling  | Tailwind CSS v4, shadcn/ui primitives           |
| Database | SQLite via `bun:sqlite` + Drizzle ORM           |
