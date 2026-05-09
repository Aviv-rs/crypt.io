import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { transactionsQueryOptions } from "../transactions.queries";
import type { SortableColumn } from "../types/transactions.types";
import { TransactionsTable } from "./TransactionsTable";
import { TransactionsPagination } from "./TransactionsPagination";

const DEFAULT_SORT: SortableColumn = "date";
const DEFAULT_DIR: "asc" | "desc" = "desc";

export function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sort, setSort] = useState<SortableColumn>(DEFAULT_SORT);
  const [dir, setDir] = useState<"asc" | "desc">(DEFAULT_DIR);

  const { data, isPending, isError, error, isFetching } = useQuery(
    transactionsQueryOptions({ page, pageSize, sort, dir }),
  );

  const transactions = data?.transactions ?? [];
  const total = data?.total ?? 0;

  const handleSortChange = (column: SortableColumn) => {
    if (column === sort) {
      setDir((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSort(column);
      setDir("desc");
    }
    setPage(1);
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
            onPageChange={setPage}
            onPageSizeChange={(nextSize) => {
              setPageSize(nextSize);
              setPage(1);
            }}
          />
        )}
      </main>
    </>
  );
}
