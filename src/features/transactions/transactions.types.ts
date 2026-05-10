import { z } from "zod";
import type { transactions } from "@/api/database/schema";

type TransactionRow = typeof transactions.$inferSelect;

export type Transaction = Omit<TransactionRow, "date"> & { date: string };

export type GetTransactionsResponse = {
  transactions: Transaction[];
  total: number;
  page: number;
  pageSize: number;
};

export const SORTABLE_COLUMNS = [
  "date",
  "method",
  "network",
  "buyAmount",
  "sellAmount",
  "feeAmount",
] as const;

export type SortableColumn = (typeof SORTABLE_COLUMNS)[number];

export const SORT_DIRECTIONS = ["asc", "desc"] as const;

export type SortDirection = (typeof SORT_DIRECTIONS)[number];

const trimmedString = z.string().trim().min(1);
const dateValue = z.coerce.date();

export const filterEntrySchema = z.discriminatedUnion("key", [
  z.object({ key: z.literal("method"), value: trimmedString }),
  z.object({ key: z.literal("network"), value: trimmedString }),
  z.object({ key: z.literal("buyCurrency"), value: trimmedString }),
  z.object({ key: z.literal("sellCurrency"), value: trimmedString }),
  z.object({ key: z.literal("dateFrom"), value: dateValue }),
  z.object({ key: z.literal("dateTo"), value: dateValue }),
]);

export type FilterEntry = z.infer<typeof filterEntrySchema>;
export type FilterableColumn = FilterEntry["key"];

export const FILTERABLE_COLUMNS = [
  "method",
  "network",
  "buyCurrency",
  "sellCurrency",
  "dateFrom",
  "dateTo",
] as const satisfies readonly FilterableColumn[];

export const TRANSACTIONS_SEARCH_DEFAULTS: {
  page: number;
  pageSize: number;
  sort: SortableColumn;
  dir: SortDirection;
  filters: FilterEntry[];
} = {
  page: 1,
  pageSize: 50,
  sort: "date",
  dir: "desc",
  filters: [],
};

export const transactionsSearchSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive()
    .default(TRANSACTIONS_SEARCH_DEFAULTS.page),
  pageSize: z.coerce
    .number()
    .int()
    .positive()
    .max(200)
    .default(TRANSACTIONS_SEARCH_DEFAULTS.pageSize),
  sort: z.enum(SORTABLE_COLUMNS).default(TRANSACTIONS_SEARCH_DEFAULTS.sort),
  dir: z.enum(SORT_DIRECTIONS).default(TRANSACTIONS_SEARCH_DEFAULTS.dir),
  filters: z.array(filterEntrySchema).default([]),
});

export type TransactionsSearch = z.infer<typeof transactionsSearchSchema>;

/**
 * Parses URL search params into TransactionsSearch.
 * Invalid or missing fields fall back to defaults instead of throwing,
 * so a stale URL (e.g. `?sort=removed_column`) still loads the page.
 */
export type TransactionsSearchInput = Partial<
  Record<keyof TransactionsSearch, unknown>
>;

export function parseSearchParamsWithFallback(
  rawSearchParams: TransactionsSearchInput,
): TransactionsSearch {
  function parseFieldOrDefault<FieldName extends keyof TransactionsSearch>(
    fieldName: FieldName,
    defaultValue: TransactionsSearch[FieldName],
  ): TransactionsSearch[FieldName] {
    const fieldSchema = transactionsSearchSchema.shape[fieldName];
    const result = fieldSchema.safeParse(rawSearchParams[fieldName]);
    return result.success
      ? (result.data as TransactionsSearch[FieldName])
      : defaultValue;
  }

  const rawFilters = Array.isArray(rawSearchParams.filters)
    ? rawSearchParams.filters
    : [];
  const validFilters = rawFilters.filter(
    (entry) => filterEntrySchema.safeParse(entry).success,
  ) as FilterEntry[];

  return {
    page: parseFieldOrDefault("page", TRANSACTIONS_SEARCH_DEFAULTS.page),
    pageSize: parseFieldOrDefault(
      "pageSize",
      TRANSACTIONS_SEARCH_DEFAULTS.pageSize,
    ),
    sort: parseFieldOrDefault("sort", TRANSACTIONS_SEARCH_DEFAULTS.sort),
    dir: parseFieldOrDefault("dir", TRANSACTIONS_SEARCH_DEFAULTS.dir),
    filters: validFilters,
  };
}

const filtersFromUrlString = z.preprocess((raw) => {
  if (raw === undefined || raw === "") return [];
  if (typeof raw !== "string") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("filters must be valid JSON");
  }
}, z.array(filterEntrySchema));

export const getTransactionsParamsSchema = transactionsSearchSchema.extend({
  filters: filtersFromUrlString.default([]),
});

export type GetTransactionsParams = z.infer<typeof getTransactionsParamsSchema>;

export function parseGetTransactionsParams(
  searchParams: URLSearchParams,
): GetTransactionsParams {
  return getTransactionsParamsSchema.parse(Object.fromEntries(searchParams));
}
