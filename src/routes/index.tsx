import { Badge, Button, Card, Heading, Table, Text } from "@/components/ui";
import { ErrorAlert } from "@/components/ui/error-alert";
import { HubsProvider } from "@/contexts/hubs";
import { useHubs } from "@/hooks/use-hubs";
import { disconnect, Hub, shutdown } from "@/lib/hub";
import { createFileRoute } from "@tanstack/react-router";
import { BluetoothIcon } from "lucide-react";
import { Box, styled } from "styled-system/jsx";

export const Route = createFileRoute("/")({ component: RouteComponent });

function RouteComponent() {
  return (
    <HubsProvider>
      <Columns />
    </HubsProvider>
  );
}

export function Columns() {
  // const { hubs } = useHubs();

  const hubs: Hub[] = [{ id: crypto.randomUUID(), name: "Technic Hub B", device: null as any, capabilities: { maxWriteSize: 24 } }];

  let columnBefore = null;
  let columnAfter = null;

  if (hubs.length === 0) {
    columnBefore = (
      <Column>
        <ConnectHubCard title="No hub connected" description="Let's connect a hub to get started." />
      </Column>
    );
  } else {
    columnAfter = (
      <Column>
        <ConnectHubCard title="Connect another hub" description="Manage multiple all from one place." />
      </Column>
    );
  }

  return (
    <styled.main p="8" display="grid" gridTemplateColumns={{ md: "1fr 1fr", lg: "1fr 1fr 1fr" }} gap="6">
      {columnBefore}
      {hubs.map((hub) => (
        <Column key={hub.id}>
          <DetailsCard hub={hub} />
          <SystemCard hub={hub} />
          <MessagesCard />
        </Column>
      ))}

      {columnAfter}
    </styled.main>
  );
}

function Column({ children }: { children: React.ReactNode }) {
  return (
    <styled.div display="flex" flexDirection="column" gap="4">
      {children}
    </styled.div>
  );
}

function ConnectHubCard({ title, description }: { title?: string; description: string }) {
  const { requestAndConnect, isConnecting, error } = useHubs();

  return (
    <Card.Root p="6" gap="4">
      <Box bg="gray.2" minH="48" borderRadius="l2" display="flex" alignItems="center" justifyContent="center" p="6">
        <styled.div textAlign="center">
          <Heading>{title}</Heading>
          <Text color="fg.muted">{description}</Text>
          <Button colorPalette="[primary]" mt="4" loading={isConnecting} onClick={requestAndConnect}>
            <BluetoothIcon />
            Connect
          </Button>
        </styled.div>
      </Box>
      {error && <ErrorAlert description={error.message} />}
    </Card.Root>
  );
}

function DetailsCard({ hub }: { hub: Hub }) {
  return (
    <Card.Root>
      <Card.Header flexDirection="row" justifyContent="space-between" alignItems="center" gap="4">
        <Card.Title>{hub.name}</Card.Title>

        <Button size="xs" variant="surface" onClick={() => disconnect(hub)}>
          Disconnect
        </Button>
      </Card.Header>
      <Card.Body>
        <Table.Root variant="surface">
          <Table.Head>
            <Table.Row>
              <Table.Header>Status</Table.Header>
              <Table.Header>Max Write Size</Table.Header>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Table.Row>
              <Table.Cell>
                <Badge colorPalette="[success]">Connected</Badge>
              </Table.Cell>
              <Table.Cell>{hub.capabilities.maxWriteSize}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </Card.Body>
    </Card.Root>
  );
}

function SystemCard({ hub }: { hub: Hub }) {
  return (
    <Card.Root>
      <Card.Header flexDirection="row" justifyContent="space-between" alignItems="center" gap="4">
        <Card.Title>System</Card.Title>
        <Button size="xs" variant="surface" colorPalette="[danger]" onClick={() => shutdown(hub)}>
          Shutdown
        </Button>
      </Card.Header>
    </Card.Root>
  );
}

function MessagesCard() {
  return (
    <Card.Root>
      <Card.Header flexDirection="row" justifyContent="space-between" alignItems="center" gap="4">
        <Card.Title>Messages</Card.Title>
      </Card.Header>
    </Card.Root>
  );
}
