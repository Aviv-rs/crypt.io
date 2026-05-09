import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import type {
  GetTransactionsResponse,
  SortableColumn,
} from "./types/transactions.types";

export type GetTransactionsRequest = {
  page: number;
  pageSize: number;
  sort: SortableColumn;
  dir: "asc" | "desc";
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

  const response = await fetch(url, { signal });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Failed to load transactions (${response.status}): ${detail}`,
    );
  }
  return response.json();
}

export function transactionsQueryOptions(params: GetTransactionsRequest) {
  return queryOptions({
    queryKey: ["transactions", params] as const,
    queryFn: ({ signal }) => fetchTransactions(params, signal),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
