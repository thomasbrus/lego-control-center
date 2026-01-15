import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import * as TanstackQuery from "./integrations/tanstack-query/root-provider";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
export const getRouter = () => {
  const tqContext = TanstackQuery.getContext();

  const router = createRouter({
    routeTree,
    context: {
      ...tqContext,
    },
    defaultPreload: "intent",
  });

  setupRouterSsrQueryIntegration({ router, queryClient: tqContext.queryClient });

  return router;
};
