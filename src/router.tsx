import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  stripSearchParams,
} from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { NotFound } from "@/components/NotFound";
import { PageLoader } from "@/components/PageLoader";
import { TransactionsPage } from "@/features/transactions/components/TransactionsPage";
import { transactionsQueryOptions } from "@/features/transactions/transactions.queries";
import {
  TRANSACTIONS_SEARCH_DEFAULTS,
  transactionsSearchSchema,
} from "@/features/transactions/transactions.types";
import { queryClient } from "@/queryClient";

const rootRoute = createRootRoute({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
  notFoundComponent: NotFound,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: transactionsSearchSchema,
  search: {
    middlewares: [stripSearchParams(TRANSACTIONS_SEARCH_DEFAULTS)],
  },
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => {
    void queryClient.prefetchQuery(transactionsQueryOptions(deps));
  },
  component: TransactionsPage,
});

const routeTree = rootRoute.addChildren([indexRoute]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPendingComponent: PageLoader,
});

export { indexRoute };

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
