import { z } from "zod";
import { SORTABLE_COLUMNS } from "../types/transactions.types";

export const getTransactionsParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(200).default(50),
  sort: z.enum(SORTABLE_COLUMNS).default("date"),
  dir: z.enum(["asc", "desc"]).default("desc"),
});

export type GetTransactionsParams = z.infer<typeof getTransactionsParamsSchema>;

export function parseGetTransactionsParams(
  searchParams: URLSearchParams,
): GetTransactionsParams {
  return getTransactionsParamsSchema.parse(Object.fromEntries(searchParams));
}
