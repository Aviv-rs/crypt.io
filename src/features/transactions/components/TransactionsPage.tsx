import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function TransactionsPage() {
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
      <main className="flex-1 px-4 md:px-6 py-6">
        <section
          className="rounded-lg border border-border bg-card p-10 text-center text-sm text-muted-foreground"
          aria-busy="true"
        >
          Loading transactions…
        </section>
      </main>
    </>
  );
}
