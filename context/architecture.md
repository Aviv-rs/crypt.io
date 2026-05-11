# Architecture Context

## Stack

| Layer       | Technology                                                           | Role                                                                          |
| ----------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Runtime     | Bun ≥ 1.3                                                            | Server, bundler, test runner, package manager                                 |
| HTTP server | `Bun.serve()` with HTML imports                                      | Routes API + serves the SPA shell. No Express, no Vite                        |
| Frontend    | React 19                                                             | UI                                                                            |
| Routing     | TanStack Router                                                      | Typed URL search state, loaders, `<Link>`                                    |
| Styling     | Tailwind CSS v4 + shadcn-style primitives (`@base-ui/react`)         | Token-driven dark theme; primitives in `src/components/ui`                    |
| Server data | Drizzle ORM + `bun:sqlite`                                           | Typed SQL against `database.db`                                               |
| Client data | TanStack Query                                                       | Paged fetches, cache, loading/error states, request dedup                     |
| Compiler    | React Compiler                                                       | Auto-memoization at build time; removes most need for `useMemo`/`useCallback` |
| Icons       | `lucide-react`                                                       | Stroke-based; `currentColor`; sizes 14/16/20/24                               |
| Validation  | Zod in `transactions.types.ts`                                       | Shared query-param shape, coercion, and error messages for client + server    |
| Toasts      | Sonner + `next-themes`                                               | User feedback (e.g. export failures); `ThemeProvider` for toaster theme       |
| Spreadsheet | Hand-written CSV in `export-transactions-to-csv.ts`                | Zero third-party spreadsheet libs — assignment hard rule                      |

## System Boundaries

- `src/index.ts` — entry. Wires `Bun.serve` routes to controllers, imports `index.html`. No business logic.
- `src/index.html`, `src/frontend.tsx`, `src/App.tsx` — SPA shell. `App` mounts `ThemeProvider`, `QueryClientProvider`, `RouterProvider`, and `Toaster`.
- `src/router.tsx` — TanStack Router: `rootRoute` (`AppLayout` + `<Outlet />`, `notFoundComponent`, `errorComponent`) and index route `/` with `validateSearch`, `stripSearchParams` middleware, loader prefetch, `TransactionsPage`.
- `src/queryClient.ts` — shared `QueryClient` for the app and route loaders.
- `src/api/database/` — Drizzle client + schema (`index.ts`, `schema.ts`, `relations.ts`). Single source of truth for the table shape. Server-only.
- `src/features/transactions/` — vertical feature module. Bun bundles only what `frontend.tsx` transitively imports; `server/` stays out of the browser bundle as long as `components/` never imports server modules.
  - `server/transactions.controller.ts` — `getTransactions`, `exportTransactions`; exports `transactionsRoutes` map for `src/index.ts`.
  - `server/export-transactions-to-csv.ts` — RFC-4180 helpers + UTF-8 BOM; no spreadsheet dependencies.
  - `transactions.types.ts` — Zod schemas (`parseGetTransactionsParams`, search defaults, `FilterEntry`, etc.) and wire types (`Transaction`, `GetTransactionsResponse`).
  - `transactions.queries.ts` — `transactionsQueryOptions`; private `fetchTransactions` for `GET /api/transactions`.
  - `components/` — `TransactionsPage`, table, cards, `FilterBar`, `ExportMenu`, `RowDetail`, etc. Never imports from `server/`.
  - `utils/` — feature formatters.
- `src/components/` — cross-feature shell (`AppLayout`, `TopBar`, `NotFound`, `PageLoader`, etc.).
- `src/components/ui/` — shadcn-style primitives; extended where needed (e.g. `Button` `loading`, Sonner `Toaster`).
- `src/lib/` — `cn` and shared helpers.
- `src/assets/styles/index.css` — design tokens (CSS variables) + Tailwind v4 layer config.
- `context/` — spec-driven workflow files.

## Storage Model

- **SQLite database** (`src/api/database/database.db`) — the entire dataset. Read-only for this app. Schema in `src/api/database/schema.ts`.
- **In-memory client cache** — TanStack Query holds paged results. No persistence, no localStorage.
- **URL search params** — canonical state for `page`, `pageSize`, `sort`, `dir`, and JSON `filters`. Reload preserves the view.

## Auth and Access Model

No authentication. Single-user, public-by-default. No mutations exposed; `/api/transactions` and `/api/transactions/export` are read-only. No CSRF surface.

## API Surface

- **`GET /api/transactions`** — paged list. Query params: `page`, `pageSize`, `sort`, `dir`, optional `filters` (JSON array of `{ key, value }` per `FilterEntry`). Response: `{ transactions: Transaction[]; total: number; page: number; pageSize: number }`. Validation errors: `400` with `{ error, issues? }` from Zod where applicable.
- **`GET /api/transactions/export`** — streamed CSV. Query: `scope=view|all`; when `scope=view`, same `sort`, `dir`, and `filters` as the list endpoint; when `scope=all`, sort applies, filters ignored. Response: `Content-Type: text/csv; charset=utf-8`, `Content-Disposition: attachment; filename="transactions-{scope}-{yyyymmdd}.csv"`. Error responses use JSON `{ error: string }` where the handler returns JSON.

There is **no** separate facets/filters discovery endpoint; filter UX is free-form from the shared schema.

## Invariants

1. The frontend never receives the full dataset in one response; paging enforces that.
2. The CSV writer introduces no third-party spreadsheet libraries.
3. Server modules under `src/features/*/server/` and `src/api/database/` are not imported from client components; cross-boundary types use `import type` where needed.
4. Filter/sort/page state is validated in the router and mirrored from the URL; URL is authoritative for sharing and reload.
5. No hardcoded color hex values or font names in components — use tokens from `src/assets/styles/index.css`.
6. Product name in user-visible copy is **Crypt.io**; no reference to external orgs in code or docs.
