# Code Standards

## General

- One module, one responsibility. Components render; hooks own state; controllers own request → DB → response for one route. Split a service back out only when a controller grows non-trivial business logic.
- Fix root causes; do not add workaround branches. If a thing is broken, repair it.
- Do not mix concerns inside a file: no SQL inside a controller, no `Response` inside a service, no fetch inside a presentational component.
- Default to no comments. Add a one-liner only when the *why* is not obvious from the code.
- Delete dead code. Strip starter demo files (`APITester.tsx`, demo logos, `/api/hello*`) once their replacements land.

## TypeScript

- `strict: true` (already on in `tsconfig.json`). No `any`. Prefer `unknown` at boundaries and narrow.
- Validate all external input at the system boundary (request handlers) before passing it inward. Each feature exposes a Zod schema (`<feature>.schema.ts`) whose parser throws on invalid input; controllers translate `z.ZodError` into a 400 with `issues`.
- Domain types live next to the feature in `src/features/<feature>/types/`. Both server controllers and client query files import from there. Server-only types use `import type` from `src/api/database/schema` so Drizzle types are erased at compile time.
- Discriminated unions over boolean flags when state has more than two shapes (e.g. sort dir as `"asc" | "desc"`).

## React (React 19)

- Function components only. No class components, no `forwardRef` unless a primitive needs it (shadcn primitives already handle this).
- Component file = one default export plus its co-located small helpers; export named subcomponents only when reused.
- Hooks at the top, early returns next, JSX last.
- React Compiler is enabled and handles memoization automatically. Do not write `useMemo` or `useCallback` defensively — only add manual memoization when the compiler is verified to skip a hot path and the perf cost is measured.
- All data fetching goes through TanStack Query. Components do not call `fetch` directly; they consume `queryOptions` factories from `src/features/<feature>/<feature>.queries.ts` (e.g. `transactionsQueryOptions(params)`) via `useQuery`. The raw fetcher stays private to the queries file.
- Loading and error states are handled at the component level closest to the data, not pushed to the page root.

## Server (Bun.serve)

- `src/index.ts` is a route map only. No logic.
- Each route lives in its feature folder under `src/features/<feature>/server/`. Controller exports a `<feature>Route` record (`{ GET, POST?, ... }`) that `src/index.ts` mounts at the path. Bun.serve auto-returns 405 for verbs not in the record — do not hand-roll method-not-allowed handlers.
- A controller parses `Request`, queries Drizzle, and returns a `Response`. Always return a consistent error shape: `{ error: string }` with appropriate status. Validation errors include `{ issues }` from Zod.
- Streamed responses (CSV) use `ReadableStream` so the full dataset never sits in memory.

## Styling

- Use design tokens defined in `styles/globals.css` via shadcn's standard variable names (`--background`, `--foreground`, `--card`, `--primary`, `--muted`, `--border`, `--ring`, etc.). No hardcoded hex, rgb, or oklch values inside components.
- Tailwind v4 utility classes only. No inline `style={{}}` except for dynamic values that cannot be expressed in classes.
- Spacing follows the Tailwind scale (`p-3`, `p-4`, `p-5`, `p-6`). No arbitrary values unless tied to a token.
- Border radius: `rounded-md` for inline (chips, badges, inputs), `rounded-lg` for cards/table panel, `rounded-xl` for modals. Mapped to shadcn's `--radius` ladder.
- Tabular numerics (`font-variant-numeric: tabular-nums` via `tabular-nums` utility) on every numeric cell.

## API Routes

- Validate and parse query params before any service call. Reject unknown sort columns, clamp `pageSize`, default `page` to 1.
- Return predictable shapes: list endpoints return `{ rows, total, page, pageSize }`; export returns a CSV stream; errors return `{ error: string }`.
- No mutating verbs are exposed. `POST/PUT/DELETE` on transactions endpoints return 405.

## Data and Storage

- All transaction data lives in the committed SQLite file. Never write back to it from this app.
- Drizzle schema (`src/api/database/schema.ts`) is the single source of truth for table shape; types flow from there.
- Streaming export reads the DB in chunks (~1k rows) — never `findMany()` without bounds.

## File Organization

- `src/api/database/` — Drizzle client + schema. Server-only. Preserved path so the committed `database.db` keeps working.
- `src/features/<feature>/` — vertical slice. Server and client live side-by-side; Bun bundles only what `frontend.tsx` transitively imports, so server files stay out of the browser bundle as long as `components/` never imports `server/`.
  - `server/` — `<feature>.controller.ts` (route record), `<feature>.schema.ts` (Zod), feature-local helpers (e.g. `csv.ts`).
  - `<feature>.queries.ts` — TanStack Query `queryOptions` factories. Raw `fetch` stays private here.
  - `components/` — feature components. Never import from `server/`.
  - `hooks/`, `types/`, `utils/` — as needed.
- `src/components/` — cross-feature components (`AppLayout`, `AppSidebar`, `TopBar`, `Brand`).
- `src/components/ui/` — shadcn primitives (read-only).
- `src/lib/` — cross-feature generic utils.
- `src/assets/styles/` — global CSS + design tokens.
- `context/` — spec-driven workflow docs.

## Naming

- Files: kebab-case with a `.layer` suffix for non-component files (`transactions.controller.ts`, `transactions.schema.ts`, `transactions.queries.ts`); PascalCase for component files (`TransactionsTable.tsx`).
- Variables: no single-letter names. Loop indices are `index`, predicates take meaningful names (`row`, `transaction`, `event`, `error`), even in tight closures. The cost of one extra word is small; the cost of grepping for `r` is large.
- API paths: lowercase, plural nouns, no abbreviations or jargon. `/api/transactions`, `/api/transactions/filters`, `/api/transactions/export`. No `facets`, no acronyms a non-engineer wouldn't recognize.
- Type names describe the thing, not the layer: `Transaction`, `TransactionsPage`, `Filters` — not `TransactionDTO`, `ITransaction`.
- The product name is **Crypt.io** everywhere user-visible. No reference to any external organization in code, comments, copy, or commits.
