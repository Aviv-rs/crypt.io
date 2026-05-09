import { drizzle } from "drizzle-orm/bun-sqlite";
import { relations } from "./relations";

export const db = drizzle({
  connection: `${__dirname}/database.db`,
  relations,
});
