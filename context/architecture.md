# Architecture Context

## Stack

| Layer       | Technology                                            | Role                                                                       |
| ----------- | ----------------------------------------------------- | -------------------------------------------------------------------------- |
| Runtime     | Bun ≥ 1.3                                             | Server, bundler, test runner, package manager                              |
| HTTP server | `Bun.serve()` with HTML imports                       | Routes API + serves the SPA shell. No Express, no Vite                     |
| Frontend    | React 19                                              | UI                                                                         |
| Styling     | Tailwind CSS v4 + shadcn/ui primitives (`base-nova`)  | Token-driven dark theme; primitives in `src/components/ui` are not edited  |
| Server data | Drizzle ORM + `bun:sqlite`                            | Typed SQL against `database.db`                                            |
| Client data | TanStack Query                                        | Paged fetches, cache, loading/error states, request dedup                  |
| Compiler    | React Compiler                                        | Auto-memoization at build time; removes most need for `useMemo`/`useCallback` |
| Icons       | `lucide-react`                                        | Stroke-based; `currentColor`; sizes 14/16/20/24                            |
| Validation  | Zod schemas, colocated in each feature                | Single source of truth for query-param shape, coercion, and error messages |
| Spreadsheet | Hand-written CSV writer in `src/features/transactions/server/csv.ts` | Zero-dep — assignment hard rule                              |

## System Boundaries

- `src/index.ts` — entry. Wires `Bun.serve` routes to controllers, imports `index.html`. No business logic.
- `src/index.html`, `src/frontend.tsx`, `src/App.tsx` — SPA shell. `App` mounts `<QueryClientProvider>` and `<TransactionsPage />`.
- `src/api/database/` — Drizzle client + schema (`index.ts`, `schema.ts`, `relations.ts`). Single source of truth for the table shape. Server-only.
- `src/features/transactions/` — vertical feature module. Owns everything transactions-related, server and client. Bun bundles only what `frontend.tsx` transitively imports, so server files (`server/`) stay out of the browser bundle as long as `components/` never imports them.
  - `server/` — server-only. `transactions.controller.ts` (route handler: parses request, queries Drizzle, returns `Response`), `transactions.schema.ts` (Zod schemas + parser for query params), `csv.ts` (RFC-4180 streaming writer, lands in Unit 9). Thin enough that controller and service collapse into one file per route.
  - `api/` — client fetchers + TanStack Query option factories (`transactionsQueryOptions`, `useTransactionsQuery`). Imports response types from `server/` via `import type` only.
  - `components/` — `TransactionsTable`, `TransactionsCardList`, `FilterBar`, `Pagination`, `ExportMenu`, `RowDetail`, `MethodGlyph`, `StatusBadge`, `Address`, `Amount`. Never imports from `server/`.
  - `hooks/` — `useTransactionsParams` (URL-search-params binding), `useExportDownload`.
  - `types/` — domain types shared between client and server (`Transaction`, `SortKey`, `Filters`).
  - `utils/` — feature-specific formatters not generic enough for `src/lib`.
- `src/components/ui/` — shadcn primitives. Read-only; add via shadcn CLI, do not hand-edit.
- `src/lib/` — generic frontend utils (`cn`, generic `format` helpers used outside the feature).
- `styles/globals.css` — token definitions (CSS variables) + Tailwind v4 layer config.
- `context/` — spec-driven workflow files. The source of truth for what to build.

## Storage Model

- **SQLite database** (`src/api/database/database.db`) — the entire dataset. Read-only for this app. Schema in `src/api/database/schema.ts`. Path is unchanged from the starter so the committed DB still works.
- **In-memory client cache** — TanStack Query holds the current and adjacent paged results to make pagination feel instant. No persistence, no localStorage.
- **URL search params** — the canonical state for `page`, `pageSize`, `sort`, `dir`, and filter values. Reload preserves the view.

## Auth and Access Model

No authentication. Single-user, public-by-default. No mutations exposed; `/api/transactions` and `/api/transactions/export` are read-only. No CSRF surface.

## API Surface

- `GET /api/transactions` — paged list. Query params: `page`, `pageSize`, `sort`, `dir`, `method`, `network`, `buyCurrency`, `sellCurrency`, `dateFrom`, `dateTo`. Response: `{ rows: Transaction[]; total: number; page: number; pageSize: number }`.
- `GET /api/transactions/filters` — distinct values used to populate the filter controls: `{ methods: string[]; networks: string[]; currencies: string[] }`. Cached in client memory.
- `GET /api/transactions/export` — streamed CSV. Query params: `scope=view|all` plus the same filter/sort params as `/api/transactions` when `scope=view`. Response: `Content-Type: text/csv; charset=utf-8`, `Content-Disposition: attachment; filename="transactions-{scope}-{yyyymmdd}.csv"`.

## Invariants

1. The frontend never receives the full dataset in one response. Required by the brief and enforced by paging.
2. The CSV writer has no third-party imports — direct violation of the assignment.
3. Server code lives only under `src/features/*/server/` and `src/api/database/`. Components and hooks never import server files (would leak DB code into the browser bundle). Cross-boundary types use `import type`.
4. Filter/sort/page state lives in the URL. Client state mirrors it; URL is authoritative.
5. No hardcoded color hex values or font names in components — only design tokens defined in `styles/globals.css`.
6. `src/components/ui/*` is treated as a third-party folder. Modifications to primitives go through shadcn CLI re-adds.
7. The codebase contains no reference to any external organization. Product name is **Crypt.io**.
