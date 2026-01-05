import { Card } from "@/components/ui";
import type { QueryClient } from "@tanstack/react-query";
import { HeadContent, Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { styled } from "styled-system/jsx";
import appCss from "../styles/index.css?url";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "LEGO Control Center",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  component: RootComponent,
  shellComponent: RootDocument,
  notFoundComponent: NotFoundPage,
});

function RootComponent() {
  return (
    <styled.div mx="auto" bg="gray.2">
      <Outlet />
    </styled.div>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>{children}</body>
    </html>
  );
}

export default function NotFoundPage() {
  return (
    <styled.div h="dvh" display="grid" placeItems="center" p="8">
      <Card.Root>
        <Card.Header>
          <Card.Title color="error" fontSize="2xl">
            404
          </Card.Title>
          <Card.Title>Page Not Found</Card.Title>
        </Card.Header>
        <Card.Body>Sorry -- we couldn’t find the page you’re looking for.</Card.Body>
      </Card.Root>
    </styled.div>
  );
}
