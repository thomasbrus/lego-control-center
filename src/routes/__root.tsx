import { Card, Heading, Switch } from "@/components/ui";
import { ModeProvider } from "@/lib/mode/context";
import { useModeContext } from "@/lib/mode/hooks";
import type { QueryClient } from "@tanstack/react-query";
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
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
  shellComponent: RootDocument,
  component: RootComponent,
  notFoundComponent: NotFoundPage,
});

function RootComponent() {
  const { simulated, setSimulated, debug, setDebug } = useModeContext();

  return (
    <styled.div bg="gray.2" position="fixed" inset="0" display="grid" gridTemplateRows="auto 1fr">
      <styled.header bg="white" px="8" py="6" top="0" display="flex" alignItems="center" gap="4" colorPalette="[primary]">
        <Heading>LEGO Control Center</Heading>
        <Switch.Default
          label="Live"
          checked={!simulated}
          onCheckedChange={(details) => setSimulated(!details.checked)}
          size="sm"
          colorPalette={simulated ? "gray" : "success"}
          cursor="pointer"
        />
        <Switch.Default
          label="Debug"
          checked={debug}
          onCheckedChange={(details) => setDebug(details.checked)}
          size="sm"
          colorPalette="gray"
          cursor="pointer"
        />
      </styled.header>
      <styled.main overflow="auto">
        <Outlet />
      </styled.main>
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
        <ModeProvider>{children}</ModeProvider>
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
