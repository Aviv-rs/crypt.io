import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { indexRoute } from "@/router";
import { transactionsQueryOptions } from "../transactions.queries";
import type { FilterEntry, SortableColumn } from "../transactions.types";
import { ExportMenu } from "./ExportMenu";
import { FilterBar } from "./FilterBar";
import { TransactionsCardList } from "./TransactionsCardList";
import { TransactionsCardListSkeleton } from "./TransactionsCardListSkeleton";
import { TransactionsTable } from "./TransactionsTable";
import { TransactionsTableSkeleton } from "./TransactionsTableSkeleton";
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
      <TopBar title="Transactions">
        <ExportMenu sort={sort} dir={dir} filters={filters} />
      </TopBar>

      <main className="flex-1 px-4 md:px-6 py-6 flex flex-col gap-4">
        <FilterBar filters={filters} onChange={handleFiltersChange} />

        <section
          className="md:rounded-lg md:border md:border-border md:bg-card md:overflow-hidden"
          aria-busy={isFetching}
        >
          {isPending ? (
            <>
              <div className="hidden md:block">
                <TransactionsTableSkeleton rowCount={pageSize > 25 ? 12 : 8} />
              </div>
              <div className="md:hidden">
                <TransactionsCardListSkeleton rowCount={6} />
              </div>
            </>
          ) : isError ? (
            <div className="p-10 text-center text-sm text-destructive">
              Failed to load transactions: {error.message}
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-10 text-center text-sm flex flex-col items-center gap-1">
              <span className="text-foreground">
                No transactions match these filters.
              </span>
              <span className="text-muted-foreground">
                Try removing one or widening the date range.
              </span>
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <TransactionsTable
                  transactions={transactions}
                  sort={sort}
                  dir={dir}
                  onSortChange={handleSortChange}
                />
              </div>
              <div className="md:hidden">
                <TransactionsCardList transactions={transactions} />
              </div>
            </>
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
