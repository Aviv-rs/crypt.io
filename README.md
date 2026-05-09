# Full-stack Technical Assignment

Build a single-page application that renders crypto transaction data stored in the provided SQLite database.

---

## Overview

Your task is to build one page containing a data table over the `Transactions` dataset. The database is already populated and shipped with this repository — no external data source or seeding step is required.

You may use the included starter stack or any other stack of your choice, as long as the deliverable meets the requirements below and consumes the same dataset.

---

## Requirements

### Required

- **Data table** — display crypto transactions in a tabular view on a single page.
- **Server-side pagination or infinite scroll** — data must be fetched in pages from the server; the full dataset must not be loaded into the client at once.
- **Excel export** — provide an option to export the data (current view or full dataset) to a spreadsheet file. This must be implemented **without any third-party dependencies** — no `xlsx`, `exceljs`, `sheetjs`, or similar libraries. Write the file format directly.
- **Responsive layout** — the page must be usable on both desktop and mobile viewports.

### Nice to have

- Column filtering.
- Column sorting.

---

## Provided starter

The repository contains an optional starter stack:

| Layer    | Technology                                      |
| -------- | ----------------------------------------------- |
| Runtime  | [Bun](https://bun.sh)                           |
| Frontend | React 19, served via `Bun.serve()` HTML imports |
| Styling  | Tailwind CSS v4, shadcn/ui primitives           |
| Database | SQLite via `bun:sqlite` + Drizzle ORM           |
| Bundler  | Built into Bun — no Vite or Webpack             |

### Getting started

**Prerequisites:** Bun ≥ 1.3 — install from [bun.sh](https://bun.sh).

```bash
# Install dependencies
bun install

# Start the development server (with HMR)
bun run dev
```

The app will be available at `http://localhost:3000`.

`.env` is loaded automatically by Bun. The database file is committed to the repository at `src/api/database/database.db` and is ready to use — no migration or seeding is needed to get started.

---

## Using your own stack

You may use any framework, runtime. The following constraints apply regardless of the stack chosen:

- The same `database.db` file (or an equivalent import of the same data) must be used.
- All items in the **Required** section above must be met.
- The zero-dependency rule for Excel export applies unconditionally.

---

## Deliverable

A runnable project with a `README` that explains how to install and start it.
