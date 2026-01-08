import { Badge, Button, Card, Group, Table } from "@/components/ui";
import { useHubs } from "@/hooks/use-hubs";
import { disconnect, Hub, shutdown } from "@/lib/hub";
import { BluetoothIcon } from "lucide-react";
import { ErrorAlert } from "./ui/error-alert";

export function HubsCard() {
  const { hubs, requestAndConnect, isConnecting, error } = useHubs();

  async function handleConnect() {
    await requestAndConnect();
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
      <Card.Body>{hubs.length ? <ConnectedHubsTable hubs={hubs} /> : <div></div>}</Card.Body>
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
          <Button size="xs" variant="surface" onClick={() => disconnect(hub)}>
            Disconnect
          </Button>
          <Button size="xs" variant="surface" colorPalette="[danger]" onClick={() => shutdown(hub)}>
            Shutdown
          </Button>
        </Group>
      </Table.Cell>
    </Table.Row>
  );
}
