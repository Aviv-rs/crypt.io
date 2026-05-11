import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
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
  parseSearchParamsWithFallback,
} from "@/features/transactions/transactions.types";
import { queryClient } from "@/queryClient";

function RouterRootError({ error }: { error: unknown }) {
  const message =
    error instanceof Error ? error.message : "Something went wrong";
  return (
    <AppLayout>
      <div className="flex min-h-[50vh] flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-sm font-medium text-destructive">
          Something went wrong
        </p>
        <p className="max-w-md text-xs text-muted-foreground">{message}</p>
        <Link
          to="/"
          search={TRANSACTIONS_SEARCH_DEFAULTS}
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          Back to transactions
        </Link>
      </div>
    </AppLayout>
  );
}

const rootRoute = createRootRoute({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
  notFoundComponent: NotFound,
  errorComponent: RouterRootError,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: parseSearchParamsWithFallback,
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
