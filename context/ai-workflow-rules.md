# AI Workflow Rules

## Approach

Build this project incrementally using a spec-driven workflow. The files in `context/` define **what** to build, **how** to build it, and **what state** progress is in. Always implement against these specs. Do not infer or invent behavior from scratch. If a spec is silent, ask — do not guess.

This is a take-home that the developer will be interviewed on. Every file, every dependency, every line must be defendable in a live conversation. AI-generated code that the developer can't explain is a regression, not a contribution.

## Scoping Rules

- Work on one feature unit at a time. A unit is a single bullet from the **Build order** in `progress-tracker.md`.
- Prefer small, verifiable increments over large speculative changes. Each unit should be runnable end-to-end before the next begins.
- Do not combine unrelated system boundaries (e.g. UI + new server route + token changes) in one step.
- If a change cannot be verified end to end inside the dev server in under 5 minutes, the scope is too broad — split it.

## When to Split Work

Split an implementation step if it combines:

- Frontend feature work and a new server endpoint.
- Multiple unrelated controllers, services, or routes.
- Token / theme changes and component changes.
- Behavior not clearly defined in `project-overview.md` or `architecture.md`.

## Handling Missing Requirements

- Do not invent product behavior not defined in the context files.
- If a requirement is ambiguous, resolve it in the relevant context file _before_ implementing.
- If a requirement is missing, log it under **Open Questions** in `progress-tracker.md` and pause that unit until it's answered.

## Protected Files

Do not modify the following unless explicitly instructed:

- `src/components/ui/*` — shadcn primitives. Add new ones via the shadcn CLI; do not hand-edit existing primitives.
- `src/api/database/database.db` — committed dataset. Read-only.
- `src/api/database/schema.ts`, `src/api/database/relations.ts` — Drizzle schema reflects the existing DB; changing it without a migration desyncs the table.
- `bun.lock`, `package.json` — only modify via `bun add`/`bun remove`. No hand-edits.

## Naming Discipline

- Public-facing names use plain English nouns. No internal jargon (no `facets`, no `DTOs` in API paths, no acronyms a non-engineer wouldn't recognize). See `code-standards.md` → Naming.
- Product name is **Crypt.io**. The codebase contains no reference to any other organization, even in comments, commit messages, or test fixtures. Treat this as an independent project.

## External Dependencies

- The export pipeline must remain free of `xlsx`, `exceljs`, `sheetjs`, or equivalent — assignment hard rule.
- All other deps need a one-line justification in **Architecture Decisions** in `progress-tracker.md` before being installed. If the justification is "I want it," do not install it.

## Visual References

- `colors_and_type.css` and `README.md` from the external Aurora design folder are the source of color and type _values_. Token _names_ in this codebase follow shadcn convention (see `ui-context.md`).
- The generated mockup React app in `my-react-app/src/` is a layout reference only — do not import its code. Lift visual decisions; do not lift screens, components, or features that aren't in scope per `project-overview.md`.

## Keeping Docs in Sync

Update the relevant context file the same commit any of these change:

- System architecture or boundaries → `architecture.md`.
- Storage decisions, invariants → `architecture.md`.
- Code conventions → `code-standards.md`.
- Visual tokens, layout patterns, copy voice → `ui-context.md`.
- Feature scope, success criteria → `project-overview.md`.
- Implementation status → `progress-tracker.md` (every unit).

## Before Moving to the Next Unit

1. The current unit works end to end within its defined scope (verified manually in the dev server, against the success criteria).
2. No invariant in `architecture.md` is violated.
3. `progress-tracker.md` has been updated: completed item moved to **Completed**, next unit set as **Current Goal**.
4. The dev server starts cleanly (`bun run dev`) and any new tests pass (`bun test`).
5. The diff is something the developer can walk a panel through, line by line, without notes.
