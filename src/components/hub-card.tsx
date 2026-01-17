import { Badge, Button, Card, Icon, Progress, PropertyList } from "@/components/ui";
import * as HubCommands from "@/lib/hub/commands";
import * as HubHooks from "@/lib/hub/hooks";
import { Hub, HubPhase } from "@/lib/hub/types";
import * as HubUtils from "@/lib/hub/utils";
import { useModeContext } from "@/lib/mode/hooks";
import * as SimulatedHubHooks from "@/lib/simulated-hub/hooks";
import { BluetoothConnectedIcon } from "lucide-react";
import { styled } from "styled-system/jsx";

export function HubCard({ hub, launchProgramProgress }: { hub: Hub; launchProgramProgress: number }) {
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
      <Card.Header flexDirection="row" alignItems="center" gap="2">
        <Icon size="md">
          <BluetoothConnectedIcon />
        </Icon>
        <Card.Title>{hub.name}</Card.Title>
        {hub.type !== undefined && (
          <styled.div ml="auto" p="4" my="-4" mr="-4" borderRadius="l2">
            <styled.img src={`/images/hubs/${hub.type.id}.png`} alt={hub.type.name} w="12" mixBlendMode="luminosity" />
          </styled.div>
        )}
      </Card.Header>
      <Card.Body>
        <PropertyList.Root>
          {hub.type !== undefined && (
            <PropertyList.Item>
              <PropertyList.Label>Type</PropertyList.Label>
              <PropertyList.Value>{hub.type.name}</PropertyList.Value>
            </PropertyList.Item>
          )}
          <PropertyList.Item>
            <PropertyList.Label>Status</PropertyList.Label>
            <PropertyList.Value>
              <PhaseBadge phase={hub.phase} />
            </PropertyList.Value>
          </PropertyList.Item>
          {hub.phase === HubPhase.LaunchingProgram && (
            <PropertyList.Item>
              <PropertyList.Label>Progress</PropertyList.Label>
              <PropertyList.Value placeSelf="auto">
                <Progress.Default value={launchProgramProgress} />
              </PropertyList.Value>
            </PropertyList.Item>
          )}
          {hub.batteryPercentage !== undefined && (
            <PropertyList.Item>
              <PropertyList.Label>Battery</PropertyList.Label>
              <PropertyList.Value placeSelf="end">
                <Progress.Default value={hub.batteryPercentage} w="32" colorPalette="green" />
              </PropertyList.Value>
            </PropertyList.Item>
          )}
        </PropertyList.Root>
      </Card.Body>
      <Card.Footer>
        <Button variant="surface" onClick={handleDisconnect} disabled={!HubUtils.isConnected(hub)}>
          Disconnect
        </Button>
        <Button variant="solid" onClick={handleShutdown} disabled={!HubUtils.isAtLeastPhase(hub, HubPhase.Running)}>
          Shutdown
        </Button>
      </Card.Footer>
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
      return <Badge colorPalette="yellow">Starting Notifications...</Badge>;
    case HubPhase.RetrievingCapabilities:
      return <Badge colorPalette="yellow">Retrieving Capabilities...</Badge>;
    case HubPhase.StartingRepl:
      return <Badge colorPalette="yellow">Starting REPL...</Badge>;
    case HubPhase.LaunchingProgram:
      return <Badge colorPalette="green">Launching Program...</Badge>;
    case HubPhase.Ready:
      return <Badge colorPalette="blue">Ready</Badge>;
    case HubPhase.Running:
      return <Badge colorPalette="blue">Running</Badge>;
    case HubPhase.Error:
      return <Badge colorPalette="red">Error</Badge>;
    default:
      return <Badge>Unknown</Badge>;
  }
}
