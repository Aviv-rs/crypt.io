import { z } from "zod";

export const getTransactionsParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(200).default(50),
});

export type GetTransactionsParams = z.infer<typeof getTransactionsParamsSchema>;

export function parseGetTransactionsParams(
  searchParams: URLSearchParams,
): GetTransactionsParams {
  return getTransactionsParamsSchema.parse(Object.fromEntries(searchParams));
}
