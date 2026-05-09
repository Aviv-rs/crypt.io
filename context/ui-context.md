# UI Context

## Theme

Dark mode in v1. The product is a dense, technical workspace for scanning transaction data — layered near-black backgrounds, vivid status colors used sparingly, no decorative gradients or imagery in product chrome. Token names are theme-neutral so a future `.light` overrides block + header toggle adds light support without touching components. `<html>` carries `class="dark"` while v1 ships.

## Design Tokens

All colors, radii, fonts, and motion live as CSS custom properties in `styles/globals.css` using shadcn/ui's standard token names. Components read tokens through Tailwind utilities or `var(--token)` — **never** hardcoded hex, rgb, or oklch values inline. The OKLCH palette and treatments come from a separate visual reference; only the *values* are imported, not the naming scheme.

## Visual References

The Aurora design system kit lives outside this repo: a token CSS file (color + type values) and a generated mockup React app (desktop + mobile layouts). Treat both as reference only — pull token values and lift composition / density choices, but do not import code from them and do not pull in screens beyond what `project-overview.md` defines.

## Colors

| Role                           | CSS Variable             | Usage                                                  |
| ------------------------------ | ------------------------ | ------------------------------------------------------ |
| Page background                | `--background`           | Outer page chrome                                      |
| Page foreground / primary text | `--foreground`           | Default text color                                     |
| Card / panel surface           | `--card`                 | Table panel, filter bar, row cards on mobile           |
| Card foreground                | `--card-foreground`      | Text on card surfaces                                  |
| Popover surface                | `--popover`              | Export menu, filter dropdowns                          |
| Popover foreground             | `--popover-foreground`   | Text inside popovers                                   |
| Primary accent                 | `--primary`              | Primary buttons, focus ring base, brand glyph          |
| Primary foreground             | `--primary-foreground`   | Text/icon on primary surface                           |
| Secondary surface              | `--secondary`            | Secondary buttons, subtle fills                        |
| Muted surface                  | `--muted`                | Empty states, table header bg, skeleton rows           |
| Muted foreground               | `--muted-foreground`     | Helper text, column labels                             |
| Accent                         | `--accent`               | Hover layers on rows, popover items                    |
| Accent foreground              | `--accent-foreground`    | Text on accent                                         |
| Border                         | `--border`               | Universal 1px divider color                            |
| Input border                   | `--input`                | Form control borders                                   |
| Focus ring                     | `--ring`                 | 2px focus outline                                      |
| Destructive                    | `--destructive`          | Withdrawals, error states                              |
| Destructive foreground         | `--destructive-foreground` | Text on destructive                                  |
| Success                        | `--success`              | Deposits / inbound, "Succeeded" badge                  |
| Success foreground             | `--success-foreground`   | Text on success surfaces                               |
| Warning                        | `--warning`              | Pending states, fee badges                             |
| Warning foreground             | `--warning-foreground`   | Text on warning surfaces                               |
| Info                           | `--info`                 | Trades / swaps, contract calls                         |
| Info foreground                | `--info-foreground`      | Text on info surfaces                                  |
| Error                          | `--destructive`          | Use the existing destructive token; do not alias       |

Token *values* live inside `:root` (dark) while `<html class="dark">` is forced; a `.light` override block can be added later without touching consumers. Status colors use semantic names (`--success`, `--warning`, `--info`, `--destructive`) instead of the shadcn default `--chart-N` slots — clearer intent at the call site.

## Typography

| Role           | Font                       | CSS Variable    | Where                                          |
| -------------- | -------------------------- | --------------- | ---------------------------------------------- |
| UI / body      | Inter Variable             | `--font-sans`   | Everything by default                          |
| Mono           | JetBrains Mono Variable    | `--font-mono`   | Tx hashes, addresses, raw payloads             |

Loaded as local variable fonts via `@font-face` in `src/assets/styles/index.css` (TTFs in `src/assets/fonts/`). Sizes use Tailwind's `text-xs`/`text-sm`/`text-base`/`text-lg`/`text-2xl`/`text-4xl`. Body is `text-sm`; transactions row content is `text-[13px]` with `tabular-nums`. Weights: 400 body, 500 strong, 600 numeric emphasis. No 700 in product chrome.

## Border Radius

Mapped to shadcn's `--radius` scale (`--radius`, `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`).

| Context                       | Class           |
| ----------------------------- | --------------- |
| Inline (chips, badges, pills) | `rounded-md`    |
| Inputs, buttons               | `rounded-md`    |
| Cards, table panel            | `rounded-lg`    |
| Modals, popovers              | `rounded-xl`    |
| Avatars, round action buttons | `rounded-full`  |

## Elevation

No drop shadows in the dark surface stack. Elevation reads through opacity steps over `--background`:

- Page: `--background`.
- Panel / card: `--card` (a slightly lighter surface).
- Popover / hover: `--popover` (lighter still).

Each elevated surface carries a 1px `--border` outline. Sticky table header may use `backdrop-filter: blur(8px)` over scrolling content with a 60% surface alpha.

## Component Library

shadcn/ui (`base-nova` style) sits in `src/components/ui/`. Add new primitives via the shadcn CLI; do not hand-edit. Feature-specific composition (e.g. the table itself, filter bar, pagination) lives under `src/features/transactions/components/` and *uses* primitives but is not stored alongside them.

## Layout Patterns

- **Page chrome**: top header (`h-16`) with brand glyph + page title + Export menu. No sidebar in v1.
- **Content**: a centered `max-w-screen-2xl` panel containing the filter bar, the table panel, and pagination at the bottom.
- **Filter bar**: horizontal row of inputs + selects above the table on desktop; collapses behind a "Filters" toggle on mobile.
- **Table panel**: card-styled (`--card` + 1px border + `rounded-lg`), full panel width, sticky `<thead>`.
- **Mobile reflow** (`<768px`): table replaced by a vertical list of cards. Each card holds method glyph + amount, address, timestamp.
- **Modals/popovers**: centered overlay over `--background` with backdrop alpha.

## Interaction States

- Hover (rows): brighten background one step toward `--accent`; brighten border ~6% lightness.
- Hover (buttons): brighten background by ~5% lightness; never darken.
- Press (buttons): `transform: scale(0.98)` for 80ms.
- Press (rows): expand inline to reveal detail row.
- Focus (`:focus-visible`): 2px solid `--ring`, 2px offset.
- Motion: standard easing `cubic-bezier(0.4, 0, 0.2, 1)`, durations 150ms (micro), 200ms (state), 300ms (layout). No spring/bounce.

## Numeric & Address Formatting

- Crypto amounts: 4 decimals in tables (`6.0000 ETH`); fiat 2 decimals with thousands separator.
- Null values: em-dash `—` (U+2014). Never `N/A`, blank, or `null`.
- Addresses and tx hashes: middle-truncated, lowercase, with `0x` prefix — `0x32b...2d88`. Never head/tail-truncate.
- Token symbols: ALL CAPS.
- Status verbs: past tense for terminal (`Succeeded`, `Failed`); present continuous for in-flight (`Pending`).

## Icons

`lucide-react`. Stroke-based, 1.5px weight, color `currentColor`. Sizes: `h-3.5 w-3.5` (14), `h-4 w-4` (16, default), `h-5 w-5` (20), `h-6 w-6` (24). Pair with a label whenever space allows; icon-only buttons require `aria-label` and a tooltip. No emoji, no unicode glyph icons, no hand-drawn SVGs.

## Copy Voice

Dispassionate, technical, terse. Sentence case for headings and buttons. No marketing tone, no exclamations, no emoji in product surfaces. Empty states are one short sentence + an action.
