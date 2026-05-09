import { TopBar } from "@/components/TopBar";

export function TransactionsPage() {
  return (
    <>
      <TopBar title="Transfers" />
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
