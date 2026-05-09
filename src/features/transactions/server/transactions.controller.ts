import { desc } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/api/database";
import { transactions } from "@/api/database/schema";
import { parseGetTransactionsParams } from "./transactions.schema";

export type TransactionRow = typeof transactions.$inferSelect;

export type GetTransactionsResponse = {
  rows: TransactionRow[];
  total: number;
  page: number;
  pageSize: number;
};

async function getTransactions(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const { page, pageSize } = parseGetTransactionsParams(url.searchParams);
    const offset = (page - 1) * pageSize;

    const [rows, totalRows] = await Promise.all([
      db
        .select()
        .from(transactions)
        .orderBy(desc(transactions.date))
        .limit(pageSize)
        .offset(offset),
      db.$count(transactions),
    ]);

    const body: GetTransactionsResponse = {
      rows,
      total: totalRows,
      page,
      pageSize,
    };
    return Response.json(body);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json(
        { error: "Invalid query parameters", issues: err.issues },
        { status: 400 },
      );
    }
    console.error("[GET /api/transactions]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const transactionsRoute = {
  GET: getTransactions,
};
