import { Badge, Card, Heading } from "@/components/ui";
import type { QueryClient } from "@tanstack/react-query";
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { styled } from "styled-system/jsx";
import z from "zod";
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
  validateSearch: z.object({
    testing: z.boolean().optional().catch(false),
  }),
  component: RootComponent,
  shellComponent: RootDocument,
  notFoundComponent: NotFoundPage,
});

function RootComponent() {
  const { testing } = Route.useSearch();

  return (
    <styled.div mx="auto" bg="gray.2" minH="dvh" display="grid" gridTemplateRows="auto 1fr">
      <styled.header
        bg="gray.surface.bg"
        p="8"
        borderBottomWidth="1"
        borderColor="border"
        pos="sticky"
        top="0"
        zIndex="docked"
        display="flex"
        alignItems="center"
        gap="3"
      >
        <Heading>LEGO Control Center</Heading>
        {testing && (
          <Badge size="lg" colorPalette="[green]">
            Testing Mode
          </Badge>
        )}
      </styled.header>

      <Outlet />
    </styled.div>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
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
