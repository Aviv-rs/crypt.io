import "@/assets/styles/index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { TransactionsPage } from "@/features/transactions/components/TransactionsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout>
        <TransactionsPage />
      </AppLayout>
    </QueryClientProvider>
  );
}

export default App;
