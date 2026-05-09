import { desc } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/api/database";
import { transactions as transactionsTable } from "@/api/database/schema";
import { parseGetTransactionsParams } from "./transactions.schema";
import type { GetTransactionsResponse } from "../types/transactions.types";

async function getTransactions(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const { page, pageSize } = parseGetTransactionsParams(url.searchParams);
    const offset = (page - 1) * pageSize;

    const [rows, total] = await Promise.all([
      db
        .select()
        .from(transactionsTable)
        .orderBy(desc(transactionsTable.date))
        .limit(pageSize)
        .offset(offset),
      db.$count(transactionsTable),
    ]);

    const body: GetTransactionsResponse = {
      transactions: rows.map((row) => ({
        ...row,
        date: row.date.toISOString(),
      })),
      total,
      page,
      pageSize,
    };
    return Response.json(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: "Invalid query parameters", issues: error.issues },
        { status: 400 },
      );
    }
    console.error("[GET /api/transactions]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const transactionsRoute = {
  GET: getTransactions,
};
