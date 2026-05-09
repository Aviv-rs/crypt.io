import "@/assets/styles/index.css";
import { AppLayout } from "@/components/AppLayout";
import { TransactionsPage } from "@/features/transactions/components/TransactionsPage";

export function App() {
  return (
    <AppLayout>
      <TransactionsPage />
    </AppLayout>
  );
}

export default App;
