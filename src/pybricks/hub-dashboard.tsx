import { Badge, Button, Card, Icon, Progress, PropertyList } from "@/components";
import { BluetoothConnectedIcon } from "lucide-react";
import Masonry from "react-layout-masonry";
import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";
import { PybricksHubStatus } from "@/pybricks/hub-status";
import { HubId } from "@/hubs/id";
import { getHubName, isHubConnected } from "@/hubs/hub";
import { hubStore } from "@/hubs/store";
import { disconnectHub, resetHub, shutdownHub } from "@/hubs/actions";
import { HubDashboard } from "@/hubs/dashboard";

export function PybricksHubDashboard({ hubId }: { hubId: HubId }) {
  return (
    <HubDashboard>
      <Masonry columns={{ 0: 1, 768: 2, 1280: 3 }} gap={24}>
        <DetailsCard hubId={hubId} />
      </Masonry>
    </HubDashboard>
  );
}

export function DetailsCard({ hubId }: { hubId: HubId }) {
  const hub = hubStore((state) => state.requireHub(hubId));

  return (
    <Card.Root>
      <Card.Header flexDirection="row" alignItems="center" gap="2">
        <Icon size="md">
          <BluetoothConnectedIcon />
        </Icon>
        <Card.Title>{hub.name}</Card.Title>
        {hub.type !== undefined && (
          <styled.div ml="auto" p="4" my="-7" mr="-4">
            <styled.img src={`/images/hubs/${hub.type}.png`} alt={getHubName(hub)} w="12" mixBlendMode="luminosity" />
          </styled.div>
        )}
      </Card.Header>
      <Card.Body>{<DetailsSection hubId={hubId} />}</Card.Body>
      <Card.Footer>
        {hub.error ? (
          <Button variant="plain" onClick={() => resetHub(hub.id)}>
            Back
          </Button>
        ) : (
          <>
            <Button variant="plain" onClick={() => shutdownHub(hub.id)}>
              Shutdown
            </Button>
            <Button variant="solid" colorPalette="primary" onClick={() => disconnectHub(hub.id)} disabled={!isHubConnected(hub)}>
              Disconnect
            </Button>
          </>
        )}
      </Card.Footer>
    </Card.Root>
  );
}

function DetailsSection({ hubId }: { hubId: HubId }) {
  const hub = hubStore((state) => state.requirePybricksHub(hubId));

  return (
    <PropertyList.Root>
      {hub.type !== undefined && (
        <PropertyList.Item>
          <PropertyList.Label>Type</PropertyList.Label>
          <PropertyList.Value>{getHubName(hub)}</PropertyList.Value>
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
      {hub.status === PybricksHubStatus.LoadingModule && (
        <PropertyList.Item>
          <PropertyList.Label>Progress</PropertyList.Label>
          <PropertyList.Value placeSelf="auto">
            <Progress.Default value={100} colorPalette="[success]">
              <Progress.ValueText />
            </Progress.Default>
          </PropertyList.Value>
        </PropertyList.Item>
      )}
      {hub.state?.batteryPercentage !== undefined && (
        <PropertyList.Item>
          <PropertyList.Label>Battery</PropertyList.Label>
          <PropertyList.Value placeSelf="end">
            <Progress.Default
              value={hub.state.batteryPercentage}
              w="32"
              {...batteryPercentageColorPaletteProps(hub.state.batteryPercentage)}
            >
              <Progress.ValueText />
            </Progress.Default>
          </PropertyList.Value>
        </PropertyList.Item>
      )}
    </PropertyList.Root>
  );
}

function StatusBadge({ status }: { status: PybricksHubStatus }) {
  switch (status) {
    case PybricksHubStatus.Connecting:
      return <Badge colorPalette="blue">Connecting...</Badge>;
    case PybricksHubStatus.RetrievingHubType:
      return <Badge colorPalette="yellow">Retrieving Hub Type...</Badge>;
    case PybricksHubStatus.StartingEventStream:
      return <Badge colorPalette="yellow">Starting Event Stream...</Badge>;
    case PybricksHubStatus.RetrievingCapabilities:
      return <Badge colorPalette="yellow">Retrieving Capabilities...</Badge>;
    case PybricksHubStatus.StartingRepl:
      return <Badge colorPalette="blue">Starting REPL...</Badge>;
    case PybricksHubStatus.LoadingModule:
      return <Badge colorPalette="blue">Loading Module...</Badge>;
    case PybricksHubStatus.Ready:
      return <Badge colorPalette="green">Ready</Badge>;
    case PybricksHubStatus.Error:
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
