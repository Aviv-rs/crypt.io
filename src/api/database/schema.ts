import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const transactions = sqliteTable("Transactions", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  method: text().notNull(),
  buyAmount: real(),
  buyCurrency: text(),
  buyToken: text(),
  sellAmount: real(),
  sellCurrency: text(),
  sellToken: text(),
  feeAmount: real(),
  feeCurrency: text(),
  feeToken: text(),
  date: integer({ mode: "timestamp_ms" }).notNull(),
  txHash: text(),
  blockHeight: text(),
  network: text(),
  smartContract: text(),
  senderAddress: text(),
  receiverAddress: text(),
  comments: text(),
});
