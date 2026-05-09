import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/api/database/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: "./src/api/database/database.db",
  },
});
