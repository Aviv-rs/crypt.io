import { z } from "zod";
import { SORTABLE_COLUMNS } from "../types/transactions.types";

const stringValue = z.string().trim().min(1);
const dateValue = z.coerce.date();

export const filterEntrySchema = z.discriminatedUnion("key", [
  z.object({ key: z.literal("method"), value: stringValue }),
  z.object({ key: z.literal("network"), value: stringValue }),
  z.object({ key: z.literal("buyCurrency"), value: stringValue }),
  z.object({ key: z.literal("sellCurrency"), value: stringValue }),
  z.object({ key: z.literal("dateFrom"), value: dateValue }),
  z.object({ key: z.literal("dateTo"), value: dateValue }),
]);

export type FilterEntry = z.infer<typeof filterEntrySchema>;
export type FilterableColumn = FilterEntry["key"];

const filtersParam = z.preprocess((raw) => {
  if (raw === undefined || raw === "") return [];
  if (typeof raw !== "string") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("filters must be valid JSON");
  }
}, z.array(filterEntrySchema));

export const getTransactionsParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(200).default(50),
  sort: z.enum(SORTABLE_COLUMNS).default("date"),
  dir: z.enum(["asc", "desc"]).default("desc"),
  filters: filtersParam.default([]),
});

export type GetTransactionsParams = z.infer<typeof getTransactionsParamsSchema>;

export function parseGetTransactionsParams(
  searchParams: URLSearchParams,
): GetTransactionsParams {
  return getTransactionsParamsSchema.parse(Object.fromEntries(searchParams));
}
