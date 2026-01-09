import { Badge, Button, Card, Group, Heading, Icon, RadioCardGroup, Table, Text } from "@/components/ui";
import { HubsProvider } from "@/contexts/hubs";
import { ConnectionStatus, useHubs } from "@/hooks/use-hubs";
import { useStateReconciler } from "@/hooks/use-state-reconciler";
import { DesiredState, LightState } from "@/lib/desired-state";
import { Hub, writeStdinWithResponse } from "@/lib/hub";
import { RadioGroupValueChangeDetails } from "@ark-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { BluetoothIcon, BracesIcon, LightbulbIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { css } from "styled-system/css";
import { Box, Grid, styled } from "styled-system/jsx";

export const Route = createFileRoute("/")({ component: RouteComponent });

function RouteComponent() {
  return (
    <HubsProvider>
      <Columns />
    </HubsProvider>
  );
}

export function Columns() {
  const { hubs } = useHubs();

  // const hubs: Hub[] = [{ id: crypto.randomUUID(), name: "Technic Hub B", device: null as any, capabilities: { maxWriteSize: 24 } }];

  let columnBefore = null;
  let columnAfter = null;

  if (hubs.length === 0) {
    columnBefore = (
      <div>
        <ConnectHubCard title="No hub connected" description="Let's connect a hub to get started." />
      </div>
    );
  } else {
    columnAfter = (
      <div>
        <ConnectHubCard title="Connect another hub" description="Manage multiple all from one place." />
      </div>
    );
  }

  return (
    <styled.main p="8" display="grid" gridTemplateColumns={{ md: "1fr 1fr", lg: "1fr 1fr 1fr" }} gap="6">
      {columnBefore}
      {hubs.map((hub) => (
        <HubColumn key={hub.id} hub={hub} />
      ))}

      {columnAfter}
    </styled.main>
  );
}

function HubColumn({ hub }: { hub: Hub }) {
  const [desiredState, setDesiredState] = useState<DesiredState>({ light: LightState.GREEN });

  const isReady = hub.status === ConnectionStatus.Ready;

  const commitCallback = useCallback(
    async (state: DesiredState) => {
      if (hub.status !== ConnectionStatus.Ready) return;

      if (state.light === LightState.OFF) {
        await writeStdinWithResponse(hub, `hub.light.off()\r\n`);
      } else {
        await writeStdinWithResponse(hub, `hub.light.on(${state.light})\r\n`);
      }
    },
    [hub]
  );

  const { reconcileState } = useStateReconciler(commitCallback);

  useEffect(() => {
    if (hub.status !== ConnectionStatus.Ready) return;
    reconcileState(desiredState);
  }, [JSON.stringify(desiredState), reconcileState, hub.status]);

  function setLight(light: LightState) {
    setDesiredState((prev) => ({ ...prev, light }));
  }

  return (
    <styled.div display="flex" flexDirection="column" gap="4">
      <DetailsCard hub={hub} />
      <MessagesCard />
      <LightCard light={desiredState.light} setLight={setLight} disabled={!isReady} />
      <DesiredStateCard desiredState={desiredState} />
    </styled.div>
  );
}

function ConnectHubCard({ title, description }: { title?: string; description: string }) {
  const { requestAndConnect } = useHubs();

  function handleNotification(data: DataView) {
    console.debug("Notification received:", data);
  }

  return (
    <Card.Root p="6" gap="4">
      <Box bg="gray.2" minH="48" borderRadius="l2" display="flex" alignItems="center" justifyContent="center" p="6">
        <styled.div textAlign="center">
          <Heading>{title}</Heading>
          <Text color="fg.muted">{description}</Text>
          <Button colorPalette="[primary]" mt="4" onClick={() => requestAndConnect(handleNotification)}>
            <BluetoothIcon />
            Connect
          </Button>
        </styled.div>
      </Box>
    </Card.Root>
  );
}

function getStatusBadge(status: ConnectionStatus) {
  switch (status) {
    case ConnectionStatus.Ready:
      return <Badge colorPalette="[success]">Ready</Badge>;
    case ConnectionStatus.Connecting:
      return <Badge colorPalette="[warning]">Connecting...</Badge>;
    case ConnectionStatus.RetrievingCapabilities:
      return <Badge colorPalette="[warning]">Retrieving capabilities...</Badge>;
    case ConnectionStatus.StartingRepl:
      return <Badge colorPalette="[warning]">Starting REPL...</Badge>;
    case ConnectionStatus.Disconnected:
      return <Badge colorPalette="[danger]">Disconnected</Badge>;
    case ConnectionStatus.Error:
      return <Badge colorPalette="[danger]">Error</Badge>;
    default:
      return <Badge>Unknown</Badge>;
  }
}

function DetailsCard({ hub }: { hub: Hub }) {
  const { shutdownHub, disconnectHub } = useHubs();

  const isReady = hub.status === ConnectionStatus.Ready;

  return (
    <Card.Root>
      <Card.Header flexDirection="row" justifyContent="space-between" alignItems="center" gap="4">
        <Card.Title>{hub.name}</Card.Title>
        <Group attached>
          <Button size="xs" variant="surface" colorPalette="[danger]" onClick={() => shutdownHub(hub)} disabled={!isReady}>
            Shutdown
          </Button>
          <Button size="xs" variant="surface" onClick={() => disconnectHub(hub)}>
            Disconnect
          </Button>
        </Group>
      </Card.Header>
      <Card.Body>
        <Table.Root variant="surface">
          <Table.Head>
            <Table.Row>
              <Table.Header>Status</Table.Header>
              <Table.Header>Max Write Size</Table.Header>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Table.Row>
              <Table.Cell>{getStatusBadge(hub.status)}</Table.Cell>
              <Table.Cell>{hub.capabilities?.maxWriteSize ?? "—"}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </Card.Body>
    </Card.Root>
  );
}

function DesiredStateCard({ desiredState }: { desiredState: DesiredState }) {
  return (
    <Card.Root>
      <Card.Header flexDirection="row" justifyContent="space-between" alignItems="center" gap="4">
        <Card.Title display="flex" alignItems="center" gap="2">
          <Icon size="md">
            <BracesIcon />
          </Icon>
          Desired State
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <styled.code bg="gray.2" p="2" borderRadius="l1" fontSize="sm">
          {JSON.stringify(desiredState, null, 2)}
        </styled.code>
      </Card.Body>
    </Card.Root>
  );
}

function MessagesCard() {
  return (
    <Card.Root>
      <Card.Header flexDirection="row" justifyContent="space-between" alignItems="center" gap="4">
        <Card.Title display="flex" alignItems="center" gap="2">
          <Icon size="md">
            <LightbulbIcon />
          </Icon>
          Messages
        </Card.Title>
      </Card.Header>
    </Card.Root>
  );
}

const lightChoices: { value: LightState; title: string }[] = [
  { value: LightState.OFF, title: "Off" },
  { value: LightState.GREEN, title: "Green" },
  { value: LightState.RED, title: "Red" },
  { value: LightState.BLUE, title: "Blue" },
  { value: LightState.YELLOW, title: "Yellow" },
];

function LightCard({ light, setLight, disabled }: { light: LightState; setLight: (light: LightState) => void; disabled?: boolean }) {
  function handleValueChange(details: RadioGroupValueChangeDetails) {
    setLight(details.value as LightState);
  }

  function getColorPaletteProps(value: LightState) {
    switch (value) {
      case LightState.GREEN:
        return css.raw({ colorPalette: "green" });
      case LightState.RED:
        return css.raw({ colorPalette: "red" });
      case LightState.BLUE:
        return css.raw({ colorPalette: "blue" });
      case LightState.YELLOW:
        return css.raw({ colorPalette: "yellow" });
      default:
        return {};
    }
  }

  return (
    <Card.Root>
      <Card.Header flexDirection="row" justifyContent="space-between" alignItems="center" gap="4">
        <Card.Title display="flex" alignItems="center" gap="2">
          <Icon size="md">
            <LightbulbIcon />
          </Icon>
          Light
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <RadioCardGroup.Root value={light} onValueChange={handleValueChange} disabled={disabled}>
          <Grid gridTemplateColumns="1fr 1fr" gap="2">
            {lightChoices.map((item) => (
              <RadioCardGroup.Item
                {...getColorPaletteProps(item.value)}
                bg={{ _checked: "colorPalette.2" }}
                color={{ _checked: "colorPalette.12" }}
                key={item.value}
                value={item.value}
                gridColumn={item.value === LightState.OFF ? "1 / -1" : "span 1"}
              >
                <RadioCardGroup.ItemHiddenInput />
                <RadioCardGroup.ItemText>{item.title}</RadioCardGroup.ItemText>
                <RadioCardGroup.ItemControl />
              </RadioCardGroup.Item>
            ))}
          </Grid>
        </RadioCardGroup.Root>
      </Card.Body>
    </Card.Root>
  );
}
