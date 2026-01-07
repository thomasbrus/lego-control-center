import { Badge, Button, Card, Group, Heading, Table, Text } from "@/components/ui";
import { useDevices } from "@/hooks/use-devices";
import { deviceInformationServiceUUID } from "@/lib/ble-device-info-service/protocol";
import { nordicUartServiceUUID } from "@/lib/ble-nordic-uart-service/protocol";
import { pybricksServiceUUID } from "@/lib/ble-pybricks-service/protocol";
import hub from "@/lib/hub";
import { BluetoothIcon } from "lucide-react";
import { Box, styled } from "styled-system/jsx";
import { ErrorAlert } from "./ui/error-alert";

export function HubCard() {
  const { devices, requestAndConnect, isConnecting, error } = useDevices();

  async function handleConnect() {
    await requestAndConnect({
      filters: [{ services: [pybricksServiceUUID] }],
      optionalServices: [pybricksServiceUUID, deviceInformationServiceUUID, nordicUartServiceUUID],
    });
  }

  return (
    <Card.Root>
      <Card.Header flexDirection="row" justifyContent="space-between" alignItems="center" gap="4">
        <Card.Title>Hub</Card.Title>
        <Button colorPalette="[primary]" onClick={handleConnect} loading={isConnecting}>
          <BluetoothIcon />
          Connect
        </Button>
      </Card.Header>
      <Card.Body>{devices.length ? <HubsTable connectedDevices={devices} /> : <HubEmptyState />}</Card.Body>
      {error && (
        <Card.Footer>
          <ErrorAlert description={error.message} />
        </Card.Footer>
      )}
    </Card.Root>
  );
}

function HubsTable({ connectedDevices }: { connectedDevices: BluetoothDevice[] }) {
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
        {connectedDevices.map((device) => (
          <HubsTableRow key={device.id} connectedDevice={device} />
        ))}
      </Table.Body>
    </Table.Root>
  );
}

function HubsTableRow({ connectedDevice }: { connectedDevice: BluetoothDevice }) {
  return (
    <Table.Row>
      <Table.Cell>{connectedDevice.name}</Table.Cell>
      <Table.Cell>
        <Badge colorPalette="[success]">Connected</Badge>
      </Table.Cell>
      <Table.Cell textAlign="right">
        <Group attached>
          <Button size="xs" variant="surface" onClick={() => hub.disconnect(connectedDevice)}>
            Disconnect
          </Button>
          <Button size="xs" variant="surface" colorPalette="[danger]">
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
