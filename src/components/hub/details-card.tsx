import { Badge, Button, Card, Group, Table } from "@/components/ui";
import * as HubHooks from "@/lib/hub/hooks";
import { Hub, HubStatus } from "@/lib/hub/types";
import * as HubUtils from "@/lib/hub/utils";
import { useModeContext } from "@/lib/mode/hooks";
import * as SimulatedHubHooks from "@/lib/simulated-hub/hooks";

export function DetailsCard({ hub }: { hub: Hub }) {
  const { simulated } = useModeContext();
  const { disconnect } = simulated ? SimulatedHubHooks.useHub() : HubHooks.useHub();

  function handleShutdown() {
    // Placeholder for shutdown logic
  }

  async function handleDisconnect() {
    await disconnect(hub);
  }

  const actionsDisabled = !HubUtils.isConnected(hub);

  return (
    <Card.Root>
      <Card.Header flexDirection="row" justifyContent="space-between" alignItems="center" gap="4">
        <Card.Title>{hub.name}</Card.Title>
        <Group attached>
          <Button size="xs" variant="surface" colorPalette="[danger]" onClick={handleShutdown} disabled={actionsDisabled}>
            Shutdown
          </Button>
          <Button size="xs" variant="surface" onClick={handleDisconnect} disabled={actionsDisabled}>
            Disconnect
          </Button>
        </Group>
      </Card.Header>
      <Card.Body>
        <Table.Root variant="surface">
          <Table.Head>
            <Table.Row>
              <Table.Header>Status</Table.Header>
              <Table.Header textAlign="right">Max Write Size</Table.Header>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Table.Row>
              <Table.Cell>
                <StatusBadge status={hub.status} />
              </Table.Cell>
              <Table.Cell textAlign="right" fontVariantNumeric="tabular-nums">
                {HubUtils.isWithCapabilities(hub) ? hub.capabilities.maxWriteSize : "—"}
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </Card.Body>
    </Card.Root>
  );
}

function StatusBadge({ status }: { status: HubStatus }) {
  switch (status) {
    case HubStatus.Idle:
      return <Badge colorPalette="gray">Idle</Badge>;
    case HubStatus.Connecting:
      return <Badge colorPalette="blue">Connecting...</Badge>;
    case HubStatus.Connected:
      return <Badge colorPalette="green">Connected</Badge>;
    case HubStatus.StartingNotifications:
      return <Badge colorPalette="yellow">Starting notifications...</Badge>;
    case HubStatus.RetrievingCapabilities:
      return <Badge colorPalette="yellow">Retrieving capabilities...</Badge>;
    case HubStatus.StartingRepl:
      return <Badge colorPalette="yellow">Starting REPL...</Badge>;
    case HubStatus.UploadingProgram:
      return <Badge colorPalette="yellow">Uploading program...</Badge>;
    case HubStatus.StartingProgram:
      return <Badge colorPalette="yellow">Starting program...</Badge>;
    case HubStatus.Ready:
      return <Badge colorPalette="green">Ready</Badge>;
    case HubStatus.Error:
      return <Badge colorPalette="red">Error</Badge>;
    default:
      return <Badge>Unknown</Badge>;
  }
}
