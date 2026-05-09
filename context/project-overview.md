# Crypt.io — Transactions

## Overview

Single-page web app that renders a paginated, sortable, filterable view over a populated SQLite `Transactions` dataset (crypto transfers, swaps, fees across networks). Crypt.io is an independent crypto analytics surface — a dense, dark-mode workspace for scanning multi-chain activity. Built as a self-contained portfolio project; the codebase carries no reference to any other organization. Every line must be defensible without AI assistance.

## Goals

1. Meet every **Required** rule in the assignment brief verbatim: server-paged data table, zero-dependency spreadsheet export, responsive layout.
2. Deliver both **Nice-to-have** items (server sort + server filter) without bloating scope.
3. Demonstrate frontend depth — token-driven theming, accessible table semantics, clean responsive reflow, polished interaction states — using only the starter stack (Bun + React 19 + Tailwind v4 + shadcn primitives).
4. Keep the codebase small and explainable: feature-based folders, thin controllers + services on the server.

## Core User Flow

1. User opens the app at `/` — table of transactions renders, defaulted to page 1, sorted by date desc.
2. User pages through results via prev/next + page-size selector. Total count is shown.
3. User sorts by clicking sortable column headers (date, method, network, buy/sell/fee amount).
4. User filters by method, network, currency, and date range via the filter bar; URL search params update so the view is shareable.
5. User clicks a row to expand a detail panel (txHash, blockHeight, smartContract, comments).
6. User opens the Export menu, picks **Current view** (filters + sort applied) or **Full dataset**, and a `.csv` file downloads.
7. On a mobile viewport (<768px) the table reflows into a vertical card list; all the above flows still work.

## Features

### Transactions Table

- Server-paged list (page-number model, `LIMIT/OFFSET`).
- Column sort on whitelisted columns (`date`, `method`, `network`, `buyAmount`, `sellAmount`, `feeAmount`).
- Column filter: method, network, buy/sell currency, date range.
- Row click expands a detail row with hash + block + contract + comments.
- Empty state + loading skeleton.

### CSV Export (zero-dep)

- User picks scope from a dropdown: **Current view** (honors active filters + sort) or **Full dataset** (entire table by id).
- Server hand-writes RFC-4180 CSV bytes with a UTF-8 BOM. No `xlsx`/`exceljs`/`sheetjs`.
- Streamed response — never buffer the full dataset in memory.

### Responsive Layout

- Desktop (≥768px): traditional `<table>` with sticky header.
- Mobile (<768px): same data reflows into a stacked card list. Filter bar collapses behind a toggle.

## Scope

### In Scope

- One page (`/`), one dataset, the four required behaviors plus sort + filter.
- Dark-mode-only theme driven by generic shadcn/Tailwind v4 design tokens (no platform-specific naming).
- Hand-written CSV generator + URL-driven filter/sort/page state.
- Feature-based frontend (`src/features/transactions`) and controller/service split on the server.

### Out of Scope

- Authentication, multi-tenant, real BloxTax integrations.
- Light theme, i18n, charts, dashboards beyond the single transactions page.
- Real `.xlsx` (OOXML zip) format — explicitly rejected in favor of `.csv` for honesty and time.
- Router / global state / data-fetching / form libraries.
- Virtualized rows — server paging is the contract.

## Success Criteria

1. `bun install && bun run dev` boots the app at `http://localhost:3000` with no warnings.
2. Paging traverses the entire DB; total row count matches `SELECT COUNT(*) FROM Transactions`.
3. Each sortable column toggles asc/desc and reorders rows correctly.
4. Each filter narrows results; combined filters compose; URL reflects state and survives reload.
5. Export `Current view` with filters active produces a CSV whose row count equals the filtered total; `Full dataset` equals the unfiltered total.
6. The exported CSV opens in Excel, Numbers, and LibreOffice without warnings or mojibake.
7. At <768px viewport the table reflows to cards with no horizontal overflow.
8. Keyboard: Tab focuses sort buttons, pagination, filter inputs, export menu — focus ring visible on all.
9. No third-party libraries are used to generate the spreadsheet export (no `xlsx`, `exceljs`, `sheetjs`, or equivalent). Other deps (e.g. `@tanstack/react-query`) are allowed when they earn their keep.
10. `context/progress-tracker.md` reflects current state at any point in development.
