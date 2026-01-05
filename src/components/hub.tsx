import { Badge, Button, Card, Group, Heading, Table, Text } from "@/components/ui";
import { BluetoothDeviceInfo, useBluetooth } from "@/hooks/use-bluetooth";
import { deviceInformationServiceUUID } from "@/lib/ble-device-info-service/protocol";
import { nordicUartServiceUUID } from "@/lib/ble-nordic-uart-service/protocol";
import { pybricksServiceUUID } from "@/lib/ble-pybricks-service/protocol";
import { BluetoothIcon } from "lucide-react";
import { Box, styled } from "styled-system/jsx";
import { ErrorAlert } from "./ui/error-alert";

export function HubCard() {
  const { device, isConnecting, error, requestDevice, connect, disconnect } = useBluetooth();

  async function handleConnect() {
    await requestDevice({
      filters: [{ services: [pybricksServiceUUID] }],
      optionalServices: [pybricksServiceUUID, deviceInformationServiceUUID, nordicUartServiceUUID],
    });

    await connect();
  }

  return (
    <Card.Root>
      <Card.Header flexDirection="row" justifyContent="space-between" alignItems="center" gap="4">
        <Card.Title>Hub</Card.Title>
        <Button colorPalette="[primary]" onClick={handleConnect} loading={isConnecting} disabled={device?.connected}>
          <BluetoothIcon />
          Connect
        </Button>
      </Card.Header>
      <Card.Body>{device?.connected ? <HubTable connectedDevice={device} disconnect={disconnect} /> : <HubEmptyState />}</Card.Body>
      {error && (
        <Card.Footer>
          <ErrorAlert description={error} />
        </Card.Footer>
      )}
    </Card.Root>
  );
}

function HubTable({ connectedDevice, disconnect }: { connectedDevice: BluetoothDeviceInfo; disconnect: () => void }) {
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
        <Table.Row>
          <Table.Cell>{connectedDevice.name}</Table.Cell>
          <Table.Cell>
            <Badge colorPalette="[success]">Connected</Badge>
          </Table.Cell>
          <Table.Cell textAlign="right">
            <Group attached>
              <Button size="xs" variant="surface" onClick={disconnect}>
                Disconnect
              </Button>
              <Button size="xs" variant="surface" colorPalette="[danger]">
                Shutdown
              </Button>
            </Group>
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table.Root>
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
