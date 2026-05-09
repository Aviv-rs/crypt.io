import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { indexRoute } from "@/router";
import { transactionsQueryOptions } from "../transactions.queries";
import type { FilterEntry } from "../transactions.types";
import type { SortableColumn } from "../transactions.types";
import { FilterBar } from "./FilterBar";
import { TransactionsTable } from "./TransactionsTable";
import { TransactionsPagination } from "./TransactionsPagination";

export function TransactionsPage() {
  const search = indexRoute.useSearch();
  const navigate = useNavigate({ from: indexRoute.fullPath });

  const { page, pageSize, sort, dir, filters } = search;

  const { data, isPending, isError, error, isFetching } = useQuery(
    transactionsQueryOptions({ page, pageSize, sort, dir, filters }),
  );

  const transactions = data?.transactions ?? [];
  const total = data?.total ?? 0;

  const handleFiltersChange = (nextFilters: FilterEntry[]) => {
    navigate({ search: { ...search, filters: nextFilters, page: 1 } });
  };

  const handleSortChange = (column: SortableColumn) => {
    navigate({
      search: {
        ...search,
        sort: column,
        dir: search.sort === column && search.dir === "desc" ? "asc" : "desc",
        page: 1,
      },
    });
  };

  return (
    <>
      <TopBar title="Transfers">
        <Button
          variant="outline"
          size="sm"
          disabled
          aria-disabled
          title="Available once data loads"
        >
          <Download data-icon="inline-start" />
          Export
        </Button>
      </TopBar>

      <main className="flex-1 px-4 md:px-6 py-6 flex flex-col gap-4">
        <FilterBar filters={filters} onChange={handleFiltersChange} />

        <section
          className="rounded-lg border border-border bg-card overflow-hidden"
          aria-busy={isFetching}
        >
          {isPending ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              Loading transactions…
            </div>
          ) : isError ? (
            <div className="p-10 text-center text-sm text-destructive">
              Failed to load transactions: {error.message}
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No transactions found.
            </div>
          ) : (
            <TransactionsTable
              transactions={transactions}
              sort={sort}
              dir={dir}
              onSortChange={handleSortChange}
            />
          )}
        </section>

        {!isPending && !isError && (
          <TransactionsPagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={(nextPage) =>
              navigate({ search: { ...search, page: nextPage } })
            }
            onPageSizeChange={(nextSize) =>
              navigate({
                search: { ...search, pageSize: nextSize, page: 1 },
              })
            }
          />
        )}
      </main>
    </>
  );
}
