import { Badge, Button, Card, Icon, Progress, PropertyList } from "@/components/ui";
import * as HubCommands from "@/lib/hub/commands";
import { idleHub } from "@/lib/hub/context";
import * as HubHooks from "@/lib/hub/hooks";
import { Hub, HubStatus } from "@/lib/hub/types";
import * as HubUtils from "@/lib/hub/utils";
import { useModeContext } from "@/lib/mode/hooks";
import * as SimulatedHubHooks from "@/lib/simulated-hub/hooks";
import { BluetoothConnectedIcon } from "lucide-react";
import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

export function HubCard({ hub, progress }: { hub: Hub; progress: number }) {
  const { simulated } = useModeContext();
  const { disconnect } = simulated ? SimulatedHubHooks.useHub() : HubHooks.useHub();
  const { replaceHub } = HubHooks.useHubsContext();

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
          <styled.div ml="auto" p="4" my="-7" mr="-4">
            <styled.img src={`/images/hubs/${hub.type.id}.png`} alt={hub.type.name} w="12" mixBlendMode="luminosity" />
          </styled.div>
        )}
      </Card.Header>
      <Card.Body>
        <HubDetailsSection hub={hub} progress={progress} />
      </Card.Body>
      <Card.Footer>
        {hub.error ? (
          <Button variant="plain" onClick={() => replaceHub(hub.id, idleHub)}>
            Back
          </Button>
        ) : (
          <>
            <Button variant="plain" onClick={handleShutdown} disabled={!HubUtils.isAtLeastStatus(hub, HubStatus.Running)}>
              Shutdown
            </Button>
            <Button variant="solid" colorPalette="primary" onClick={handleDisconnect} disabled={!HubUtils.isConnected(hub)}>
              Disconnect
            </Button>
          </>
        )}
      </Card.Footer>
    </Card.Root>
  );
}

function HubDetailsSection({ hub, progress }: { hub: Hub; progress: number }) {
  return (
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
          <StatusBadge status={hub.status} />
        </PropertyList.Value>
      </PropertyList.Item>
      {hub.error && (
        <PropertyList.Item>
          <PropertyList.Label>Reason</PropertyList.Label>
          <PropertyList.Value>{hub.error.message}</PropertyList.Value>
        </PropertyList.Item>
      )}
      {hub.status === HubStatus.LaunchingDeviceDetection && (
        <PropertyList.Item>
          <PropertyList.Label>Progress</PropertyList.Label>
          <PropertyList.Value placeSelf="auto">
            <Progress.Default value={progress} colorPalette="[success]">
              <Progress.ValueText />
            </Progress.Default>
          </PropertyList.Value>
        </PropertyList.Item>
      )}
      {hub.batteryPercentage !== undefined && (
        <PropertyList.Item>
          <PropertyList.Label>Battery</PropertyList.Label>
          <PropertyList.Value placeSelf="end">
            <Progress.Default value={hub.batteryPercentage} w="32" {...batteryPercentageColorPaletteProps(hub.batteryPercentage)}>
              <Progress.ValueText />
            </Progress.Default>
          </PropertyList.Value>
        </PropertyList.Item>
      )}
    </PropertyList.Root>
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
    case HubStatus.RetrievingDeviceInfo:
      return <Badge colorPalette="yellow">Retrieving Device Info...</Badge>;
    case HubStatus.StartingNotifications:
      return <Badge colorPalette="yellow">Starting Notifications...</Badge>;
    case HubStatus.RetrievingCapabilities:
      return <Badge colorPalette="yellow">Retrieving Capabilities...</Badge>;
    case HubStatus.StartingRepl:
      return <Badge colorPalette="yellow">Starting REPL...</Badge>;
    case HubStatus.LaunchingDeviceDetection:
      return <Badge colorPalette="green">Launching Device Detection...</Badge>;
    case HubStatus.Ready:
      return <Badge colorPalette="blue">Ready</Badge>;
    case HubStatus.Running:
      return <Badge colorPalette="blue">Running</Badge>;
    case HubStatus.Error:
      return <Badge colorPalette="red">Error</Badge>;
    default:
      return <Badge>Unknown</Badge>;
  }
}

function batteryPercentageColorPaletteProps(batteryPercentage: number) {
  if (batteryPercentage > 75) {
    return css.raw({ colorPalette: "success" });
  } else if (batteryPercentage > 50) {
    return css.raw({ colorPalette: "info" });
  } else if (batteryPercentage > 25) {
    return css.raw({ colorPalette: "warning" });
  } else {
    return css.raw({ colorPalette: "danger" });
  }
}
