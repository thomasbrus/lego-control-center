import { Badge, Button, Card, Group, Table } from "@/components/ui";
import * as HubCommands from "@/lib/hub/commands";
import * as HubHooks from "@/lib/hub/hooks";
import { Hub, HubStatus } from "@/lib/hub/types";
import * as HubUtils from "@/lib/hub/utils";
import { useModeContext } from "@/lib/mode/hooks";
import * as SimulatedHubHooks from "@/lib/simulated-hub/hooks";
import { styled } from "styled-system/jsx";

export function DetailsCard({ hub, launchProgramProgress }: { hub: Hub; launchProgramProgress: number }) {
  const { simulated } = useModeContext();
  const { disconnect } = simulated ? SimulatedHubHooks.useHub() : HubHooks.useHub();

  function handleShutdown() {
    HubCommands.shutdownHub(hub);
  }

  async function handleDisconnect() {
    await disconnect(hub);
  }

  return (
    <Card.Root>
      <Card.Header flexDirection="row" justifyContent="space-between" alignItems="center" gap="4">
        <Card.Title>{hub.name}</Card.Title>
        <Group attached>
          <Button size="xs" variant="surface" colorPalette="[danger]" onClick={handleShutdown} disabled={!HubUtils.isConnected(hub)}>
            Shutdown
          </Button>
          <Button size="xs" variant="surface" onClick={handleDisconnect} disabled={!HubUtils.isConnected(hub)}>
            Disconnect
          </Button>
        </Group>
      </Card.Header>
      <Card.Body>
        <Table.Root variant="surface">
          <Table.Head>
            <Table.Row>
              <Table.Header>Status</Table.Header>
              <Table.Header textAlign="right">{hub.status === HubStatus.LaunchingProgram && "Progress"}</Table.Header>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Table.Row>
              <Table.Cell>
                <StatusBadge status={hub.status} />
              </Table.Cell>
              <Table.Cell textAlign="right" fontVariantNumeric="tabular-nums">
                {hub.status === HubStatus.LaunchingProgram && `${launchProgramProgress.toFixed(0)}%`}
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
        <styled.pre mt="4" fontSize="xs" fontFamily="mono" whiteSpace="pre-wrap" wordBreak="break-all" p="2" bg="gray.2" borderRadius="l1">
          Hub: {JSON.stringify(hub.model) ?? "{}"}
        </styled.pre>
        <styled.pre mt="4" fontSize="xs" fontFamily="mono" whiteSpace="pre-wrap" wordBreak="break-all" p="2" bg="gray.2" borderRadius="l1">
          Motors: {JSON.stringify(Object.fromEntries(hub.model?.motors ?? new Map())) ?? "{}"}
        </styled.pre>
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
    case HubStatus.LaunchingProgram:
      return <Badge colorPalette="yellow">Launching program...</Badge>;
    case HubStatus.Ready:
      return <Badge colorPalette="green">Ready</Badge>;
    case HubStatus.Running:
      return <Badge colorPalette="green">Running</Badge>;
    case HubStatus.Error:
      return <Badge colorPalette="red">Error</Badge>;
    default:
      return <Badge>Unknown</Badge>;
  }
}
