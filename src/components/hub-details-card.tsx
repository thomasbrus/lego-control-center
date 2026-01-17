import { Badge, Button, Card, Group, Table } from "@/components/ui";
import * as HubCommands from "@/lib/hub/commands";
import * as HubHooks from "@/lib/hub/hooks";
import { Hub, HubPhase } from "@/lib/hub/types";
import * as HubUtils from "@/lib/hub/utils";
import { useModeContext } from "@/lib/mode/hooks";
import * as SimulatedHubHooks from "@/lib/simulated-hub/hooks";
import { styled } from "styled-system/jsx";

export function HubDetailsCard({ hub, launchProgramProgress }: { hub: Hub; launchProgramProgress: number }) {
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
              <Table.Header textAlign="right">{hub.phase === HubPhase.LaunchingProgram && "Progress"}</Table.Header>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Table.Row>
              <Table.Cell>
                <PhaseBadge phase={hub.phase} />
              </Table.Cell>
              <Table.Cell textAlign="right" fontVariantNumeric="tabular-nums">
                {hub.phase === HubPhase.LaunchingProgram && `${launchProgramProgress.toFixed(0)}%`}
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
        <styled.pre mt="4" fontSize="xs" fontFamily="mono" whiteSpace="pre-wrap" wordBreak="break-all" p="2" bg="gray.2" borderRadius="l1">
          Hub: {JSON.stringify(hub)}
        </styled.pre>
        <styled.pre mt="4" fontSize="xs" fontFamily="mono" whiteSpace="pre-wrap" wordBreak="break-all" p="2" bg="gray.2" borderRadius="l1">
          Motors: {JSON.stringify(Object.fromEntries(hub.motors ?? new Map())) ?? "{}"}
        </styled.pre>
      </Card.Body>
    </Card.Root>
  );
}

function PhaseBadge({ phase }: { phase: HubPhase }) {
  switch (phase) {
    case HubPhase.Idle:
      return <Badge colorPalette="gray">Idle</Badge>;
    case HubPhase.Connecting:
      return <Badge colorPalette="blue">Connecting...</Badge>;
    case HubPhase.Connected:
      return <Badge colorPalette="green">Connected</Badge>;
    case HubPhase.StartingNotifications:
      return <Badge colorPalette="yellow">Starting notifications...</Badge>;
    case HubPhase.RetrievingCapabilities:
      return <Badge colorPalette="yellow">Retrieving capabilities...</Badge>;
    case HubPhase.StartingRepl:
      return <Badge colorPalette="yellow">Starting REPL...</Badge>;
    case HubPhase.LaunchingProgram:
      return <Badge colorPalette="yellow">Launching program...</Badge>;
    case HubPhase.Ready:
      return <Badge colorPalette="green">Ready</Badge>;
    case HubPhase.Running:
      return <Badge colorPalette="green">Running</Badge>;
    case HubPhase.Error:
      return <Badge colorPalette="red">Error</Badge>;
    default:
      return <Badge>Unknown</Badge>;
  }
}
