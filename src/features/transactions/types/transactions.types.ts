import type { transactions } from "@/api/database/schema";

type TransactionRow = typeof transactions.$inferSelect;

export type Transaction = Omit<TransactionRow, "date"> & { date: string };

export type GetTransactionsResponse = {
  transactions: Transaction[];
  total: number;
  page: number;
  pageSize: number;
};
