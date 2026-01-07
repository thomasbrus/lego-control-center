import { Badge, Button, Card, Group, Heading, Table, Text } from "@/components/ui";
import { useHubs } from "@/hooks/use-hubs";
import api, { Hub } from "@/lib/hub/api";
import { BluetoothIcon } from "lucide-react";
import { Box, styled } from "styled-system/jsx";
import { ErrorAlert } from "./ui/error-alert";

export function HubsCard() {
  const { hubs, requestAndConnect, isConnecting, error } = useHubs();

  async function handleConnect() {
    const hub = await requestAndConnect();

    api.subscribeToUart(hub!, (data) => {
      console.log(`UART data from hub ${hub!.name}:`, data);
    });

    api.subscribeToControlEvents(hub!, (event) => {
      const message = new TextDecoder().decode(event.buffer.slice(1));
      console.log(`Control event from hub ${hub!.name}:`, message);
    });

    console.log("Preparing...");

    console.log("Starting REPL program...");
    await api.startRepl(hub!);

    console.log("Waiting for 5 seconds...");

    await new Promise((resolve) => setTimeout(resolve, 5000));

    console.log("Writing to control events...");

    api.writeStdin(hub!, new TextEncoder().encode("hub.light.on(Color.GREEN)\r\n"));
  }

  return (
    <Card.Root>
      <Card.Header flexDirection="row" justifyContent="space-between" alignItems="center" gap="4">
        <Card.Title>Hubs</Card.Title>
        <Button colorPalette="[primary]" onClick={handleConnect} loading={isConnecting}>
          <BluetoothIcon />
          Connect
        </Button>
      </Card.Header>
      <Card.Body>{hubs.length ? <ConnectedHubsTable hubs={hubs} /> : <HubEmptyState />}</Card.Body>
      {error && (
        <Card.Footer>
          <ErrorAlert description={error.message} />
        </Card.Footer>
      )}
    </Card.Root>
  );
}

function ConnectedHubsTable({ hubs }: { hubs: Hub[] }) {
  return (
    <Table.Root variant="surface">
      <Table.Head>
        <Table.Row>
          <Table.Header>Name</Table.Header>
          <Table.Header>Status</Table.Header>
          <Table.Header textAlign="right">Actions</Table.Header>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {hubs.map((hub) => (
          <ConnectedHubsTableRow key={hub.id} hub={hub} />
        ))}
      </Table.Body>
    </Table.Root>
  );
}

function ConnectedHubsTableRow({ hub }: { hub: Hub }) {
  return (
    <Table.Row>
      <Table.Cell>{hub.name}</Table.Cell>
      <Table.Cell>
        <Badge colorPalette="[success]">Connected</Badge>
      </Table.Cell>
      <Table.Cell textAlign="right">
        <Group attached>
          <Button size="xs" variant="surface" onClick={() => api.disconnect(hub)}>
            Disconnect
          </Button>
          <Button size="xs" variant="surface" colorPalette="[danger]" onClick={() => api.shutdown(hub)}>
            Shutdown
          </Button>
        </Group>
      </Table.Cell>
    </Table.Row>
  );
}

function HubEmptyState() {
  return (
    <Box bg="gray.2" minH="48" borderRadius="l2" display="flex" alignItems="center" justifyContent="center">
      <styled.div textAlign="center">
        <Heading>No hub connected</Heading>
        <Text color="fg.muted">Connect a hub to get started.</Text>
      </styled.div>
    </Box>
  );
}
