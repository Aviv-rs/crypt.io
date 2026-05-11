import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import type {
  FilterEntry,
  GetTransactionsResponse,
  SortableColumn,
  SortDirection,
} from "./transactions.types";

export type GetTransactionsRequest = {
  page: number;
  pageSize: number;
  sort: SortableColumn;
  dir: SortDirection;
  filters: FilterEntry[];
};

async function fetchTransactions(
  params: GetTransactionsRequest,
  signal?: AbortSignal,
): Promise<GetTransactionsResponse> {
  const url = new URL("/api/transactions", window.location.origin);
  url.searchParams.set("page", String(params.page));
  url.searchParams.set("pageSize", String(params.pageSize));
  url.searchParams.set("sort", params.sort);
  url.searchParams.set("dir", params.dir);
  if (params.filters.length > 0) {
    url.searchParams.set("filters", JSON.stringify(params.filters));
  }

  try {
    const response = await fetch(url, { signal });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(
        `Failed to load transactions (${response.status}): ${detail}`,
      );
    }
    return response.json();
  } catch (error) {
    console.error("[GET /api/transactions]", error);
    throw error;
  }
}

export function transactionsQueryOptions(params: GetTransactionsRequest) {
  return queryOptions({
    queryKey: ["transactions", params] as const,
    queryFn: ({ signal }) => fetchTransactions(params, signal),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
