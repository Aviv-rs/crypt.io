import { serve } from "bun";
import index from "./index.html";
import { transactionsRoutes } from "@/features/transactions/server/transactions.controller";

const portFromEnv = process.env.PORT;
const listenPort =
  portFromEnv !== undefined && portFromEnv !== ""
    ? Number.parseInt(portFromEnv, 10)
    : 3000;

const server = serve({
  hostname: "0.0.0.0",
  port: Number.isFinite(listenPort) ? listenPort : 3000,
  routes: {
    ...transactionsRoutes,
    "/": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
