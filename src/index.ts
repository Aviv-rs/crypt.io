import { serve } from "bun";
import index from "./index.html";
import { transactionsRoute } from "@/features/transactions/server/transactions.controller";

const server = serve({
  routes: {
    "/api/transactions": transactionsRoute,
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
