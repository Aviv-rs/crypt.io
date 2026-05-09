import { and, asc, desc, gte, like, lte, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/api/database";
import { transactions as transactionsTable } from "@/api/database/schema";
import {
  parseGetTransactionsParams,
  type FilterEntry,
  type GetTransactionsResponse,
  type SortableColumn,
  type SortDirection,
} from "../transactions.types";

const SORT_COLUMN_MAP = {
  date: transactionsTable.date,
  method: transactionsTable.method,
  network: transactionsTable.network,
  buyAmount: transactionsTable.buyAmount,
  sellAmount: transactionsTable.sellAmount,
  feeAmount: transactionsTable.feeAmount,
} as const;

function buildOrderBy(
  sort: SortableColumn,
  direction: SortDirection,
): SQL[] {
  const column = SORT_COLUMN_MAP[sort];
  const directional = direction === "asc" ? asc(column) : desc(column);
  return [directional, desc(transactionsTable.id)];
}

function entryToCondition(entry: FilterEntry): SQL {
  switch (entry.key) {
    case "method":
      return like(transactionsTable.method, `%${entry.value}%`);
    case "network":
      return like(transactionsTable.network, `%${entry.value}%`);
    case "buyCurrency":
      return like(transactionsTable.buyCurrency, `%${entry.value}%`);
    case "sellCurrency":
      return like(transactionsTable.sellCurrency, `%${entry.value}%`);
    case "dateFrom":
      return gte(transactionsTable.date, entry.value);
    case "dateTo":
      return lte(transactionsTable.date, entry.value);
  }
}

function buildWhere(filters: FilterEntry[]): SQL | undefined {
  if (filters.length === 0) return undefined;
  return and(...filters.map(entryToCondition));
}

async function getTransactions(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const { page, pageSize, sort, dir, filters } = parseGetTransactionsParams(
      url.searchParams,
    );
    const offset = (page - 1) * pageSize;
    const whereClause = buildWhere(filters);

    const baseRowQuery = db.select().from(transactionsTable);
    const baseCountQuery = db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(transactionsTable);

    const [rows, countResult] = await Promise.all([
      (whereClause ? baseRowQuery.where(whereClause) : baseRowQuery)
        .orderBy(...buildOrderBy(sort, dir))
        .limit(pageSize)
        .offset(offset),
      whereClause ? baseCountQuery.where(whereClause) : baseCountQuery,
    ]);

    const body: GetTransactionsResponse = {
      transactions: rows.map((row) => ({
        ...row,
        date: row.date.toISOString(),
      })),
      total: countResult[0]?.count ?? 0,
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
    if (error instanceof Error && error.message === "filters must be valid JSON") {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error("[GET /api/transactions]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const transactionsRoute = {
  GET: getTransactions,
};
