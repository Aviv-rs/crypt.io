import { and, asc, desc, gte, like, lt, sql } from "drizzle-orm";
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
import { buildCsvHeader, buildCsvRow } from "./export-transactions-to-csv";

const EXPORT_CHUNK_SIZE = 1000;

const EXPORT_COLUMNS = [
  "id",
  "method",
  "date",
  "buyAmount",
  "buyCurrency",
  "buyToken",
  "sellAmount",
  "sellCurrency",
  "sellToken",
  "feeAmount",
  "feeCurrency",
  "feeToken",
  "network",
  "txHash",
  "blockHeight",
  "smartContract",
  "senderAddress",
  "receiverAddress",
  "comments",
] as const satisfies readonly (keyof typeof transactionsTable._.columns)[];

const SORT_COLUMN_MAP = {
  date: transactionsTable.date,
  method: transactionsTable.method,
  network: transactionsTable.network,
  buyAmount: transactionsTable.buyAmount,
  sellAmount: transactionsTable.sellAmount,
  feeAmount: transactionsTable.feeAmount,
} as const;

function buildOrderBy(sort: SortableColumn, direction: SortDirection): SQL[] {
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
    case "dateTo": {
      const exclusiveEnd = new Date(entry.value.getTime() + 86_400_000); // Add 1 day to the end date to include the entire day
      return lt(transactionsTable.date, exclusiveEnd);
    }
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

    const transactionsResponse: GetTransactionsResponse = {
      transactions: rows.map((row) => ({
        ...row,
        date: row.date.toISOString(),
      })),
      total: countResult[0]?.count ?? 0,
      page,
      pageSize,
    };
    return Response.json(transactionsResponse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: "Invalid query parameters", issues: error.issues },
        { status: 400 },
      );
    }
    if (
      error instanceof Error &&
      error.message === "filters must be valid JSON"
    ) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error("[GET /api/transactions]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function exportTransactions(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const { sort, dir, filters } = parseGetTransactionsParams(url.searchParams);
    const scope = url.searchParams.get("scope") === "all" ? "all" : "view";
    const whereClause = scope === "all" ? undefined : buildWhere(filters);
    const orderBy = buildOrderBy(sort, dir);

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(buildCsvHeader(EXPORT_COLUMNS)));

        let offset = 0;
        while (true) {
          const baseQuery = db.select().from(transactionsTable);
          const chunk = await (
            whereClause ? baseQuery.where(whereClause) : baseQuery
          )
            .orderBy(...orderBy)
            .limit(EXPORT_CHUNK_SIZE)
            .offset(offset);

          if (chunk.length === 0) break;

          for (const row of chunk) {
            const values = EXPORT_COLUMNS.map((column) => row[column]);
            controller.enqueue(encoder.encode(buildCsvRow(values)));
          }

          if (chunk.length < EXPORT_CHUNK_SIZE) break;
          offset += EXPORT_CHUNK_SIZE;
        }

        controller.close();
      },
    });

    const yyyymmdd = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return new Response(stream, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="transactions-${scope}-${yyyymmdd}.csv"`,
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: "Invalid query parameters", issues: error.issues },
        { status: 400 },
      );
    }
    if (
      error instanceof Error &&
      error.message === "filters must be valid JSON"
    ) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error("[GET /api/transactions/export]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const transactionsRoutes = {
  "/api/transactions": { GET: getTransactions },
  "/api/transactions/export": { GET: exportTransactions },
};
