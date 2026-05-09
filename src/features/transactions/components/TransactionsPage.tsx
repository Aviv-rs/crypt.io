import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { transactionsQueryOptions } from "../transactions.queries";
import { TransactionsTable } from "./TransactionsTable";
import { TransactionsPagination } from "./TransactionsPagination";

export function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const { data, isPending, isError, error, isFetching } = useQuery(
    transactionsQueryOptions({ page, pageSize }),
  );

  const transactions = data?.transactions ?? [];
  const total = data?.total ?? 0;

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
            <TransactionsTable transactions={transactions} />
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
