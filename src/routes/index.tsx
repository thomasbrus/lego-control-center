import { Badge, Button, Card, Group, Heading, Icon, RadioCardGroup, ScrollArea, SegmentGroup, Table, Text } from "@/components/ui";
import { useDesiredState } from "@/lib/desired-state/hooks";
import { DesiredState, LightState } from "@/lib/desired-state/types";
import { AnyEvent } from "@/lib/events/types";
import { getEventTypeName } from "@/lib/events/utils";
import { writeStdinWithResponse } from "@/lib/hubs/actions";
import { HubsProvider } from "@/lib/hubs/context";
import { useHub, useHubActions, useHubs, useVirtualHub, useVirtualHubActions, useVirtualHubs } from "@/lib/hubs/hooks";
import { Hub, HubStatus } from "@/lib/hubs/types";
import { EventType } from "@/lib/pybricks/protocol";
import { RadioGroupValueChangeDetails } from "@ark-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { BluetoothIcon, BracesIcon, LightbulbIcon, RadioIcon } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { css, Styles } from "styled-system/css";
import { Box, Grid, styled } from "styled-system/jsx";
import z from "zod";

export const Route = createFileRoute("/")({
  validateSearch: z.object({
    testing: z.boolean().optional().catch(false),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <HubsProvider>
      <Columns />
    </HubsProvider>
  );
}

export function Columns() {
  const { testing } = Route.useSearch();
  const { hubIds } = testing ? useVirtualHubs() : useHubs();

  let columnBefore = null;
  let columnAfter = null;

  if (hubIds.length === 0) {
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
    <styled.main p="8" display="grid" gridTemplateColumns={{ md: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" }} gap="6">
      {columnBefore}
      {hubIds.map((hubId) => (
        <HubColumn key={hubId} hubId={hubId} />
      ))}

      {columnAfter}
    </styled.main>
  );
}

function HubColumn({ hubId }: { hubId: Hub["id"] }) {
  const [desiredState, setDesiredState] = useState<DesiredState>({ light: LightState.GREEN });
  const [events, setEvents] = useState<AnyEvent[]>([]);

  const handleEvent = useCallback((event: AnyEvent) => {
    setEvents((prev) => [...prev.slice(-49), event]); // Keep last 50
    console.debug("Event received:", event);
  }, []);

  const { testing } = Route.useSearch();

  const { hub } = testing ? useVirtualHub(hubId, { onEvent: handleEvent }) : useHub(hubId, { onEvent: handleEvent });
  const { disconnectHub, shutdownHub } = testing ? useVirtualHubActions(hubId) : useHubActions(hubId);

  const isReady = hub.status === HubStatus.Ready;

  const commitCallback = useCallback(
    async (state: DesiredState) => {
      if (hub.status !== HubStatus.Ready) return;

      if (state.light === LightState.OFF) {
        await writeStdinWithResponse(hub, `hub.light.off()\r\n`);
      } else {
        await writeStdinWithResponse(hub, `hub.light.on(${state.light})\r\n`);
      }
    },
    [hub]
  );

  const { reconcileState } = useDesiredState(commitCallback);

  useEffect(() => {
    if (hub.status !== HubStatus.Ready) return;
    reconcileState(desiredState);
  }, [JSON.stringify(desiredState), reconcileState, hub.status]);

  function setLight(light: LightState) {
    setDesiredState((prev) => ({ ...prev, light }));
  }

  return (
    <styled.div display="flex" flexDirection="column" gap="4">
      <DetailsCard hub={hub} disconnectHub={disconnectHub} shutdownHub={shutdownHub} />
      <EventsCard events={events} />
      <LightCard light={desiredState.light} setLight={setLight} disabled={!isReady} />
      <DesiredStateCard desiredState={desiredState} />
    </styled.div>
  );
}

function ConnectHubCard({ title, description }: { title?: string; description: string }) {
  const { testing } = Route.useSearch();
  const { connect } = testing ? useVirtualHubs() : useHubs();

  return (
    <Card.Root p="6" gap="4">
      <EmptyState title={title} description={description}>
        <Button colorPalette="[primary]" mt="4" onClick={() => connect()}>
          <BluetoothIcon />
          Connect
        </Button>
      </EmptyState>
    </Card.Root>
  );
}

function EmptyState({
  title,
  description,
  children,
  ...props
}: { title?: string; description: string; children?: React.ReactNode } & Styles) {
  const defaultProps = css.raw({
    bg: "gray.2",
    borderRadius: "l2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    px: "6",
    py: "8",
  });

  return (
    <Box {...defaultProps} {...props}>
      <styled.div textAlign="center">
        {title && <Heading>{title}</Heading>}
        {description && <Text color="fg.muted">{description}</Text>}
        {children}
      </styled.div>
    </Box>
  );
}

function getStatusBadge(status: HubStatus) {
  switch (status) {
    case HubStatus.Ready:
      return <Badge colorPalette="[success]">Ready</Badge>;
    case HubStatus.Connecting:
      return <Badge colorPalette="[warning]">Connecting...</Badge>;
    case HubStatus.RetrievingCapabilities:
      return <Badge colorPalette="[warning]">Retrieving capabilities...</Badge>;
    case HubStatus.StartingRepl:
      return <Badge colorPalette="[warning]">Starting REPL...</Badge>;
    case HubStatus.Disconnected:
      return <Badge colorPalette="[danger]">Disconnected</Badge>;
    case HubStatus.Error:
      return <Badge colorPalette="[danger]">Error</Badge>;
    default:
      return <Badge>Unknown</Badge>;
  }
}

function DetailsCard({
  hub,
  disconnectHub,
  shutdownHub,
}: {
  hub: Hub;
  disconnectHub: () => Promise<void>;
  shutdownHub: () => Promise<void>;
}) {
  const isReady = hub.status === HubStatus.Ready;

  return (
    <Card.Root>
      <Card.Header flexDirection="row" justifyContent="space-between" alignItems="center" gap="4">
        <Card.Title>{hub.name}</Card.Title>
        <Group attached>
          <Button size="xs" variant="surface" colorPalette="[danger]" onClick={shutdownHub} disabled={!isReady}>
            Shutdown
          </Button>
          <Button size="xs" variant="surface" onClick={disconnectHub}>
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

function EventsCard({ events }: { events: AnyEvent[] }) {
  const [eventType, setEventType] = useState<"all" | "status" | "stdout">("stdout");

  const eventTypes = {
    all: (_event: AnyEvent) => true,
    status: (event: AnyEvent) => event.type === EventType.StatusReport,
    stdout: (event: AnyEvent) => event.type === EventType.WriteStdout,
  };

  const filteredEvents = events.filter((event) => {
    return eventTypes[eventType](event);
  });

  const items = Object.keys(eventTypes).map((key) => ({ value: key, label: key.charAt(0).toUpperCase() + key.slice(1) }));

  return (
    <Card.Root>
      <Card.Header flexDirection="row" justifyContent="space-between" alignItems="center" gap="4">
        <Card.Title display="flex" alignItems="center" gap="2">
          <Icon size="md">
            <RadioIcon />
          </Icon>
          Events ({events.length})
        </Card.Title>
      </Card.Header>
      <Card.Body display="block">
        <SegmentGroup.Root fitted mb="4" value={eventType} onValueChange={(details) => setEventType(details.value as typeof eventType)}>
          <SegmentGroup.Indicator />
          <SegmentGroup.Items items={items} />
        </SegmentGroup.Root>
        {filteredEvents.length === 0 ? <EmptyState description="No events yet." /> : <EventsTable events={filteredEvents} />}
      </Card.Body>
    </Card.Root>
  );
}

function EventsTable({ events }: { events: AnyEvent[] }) {
  return (
    <ScrollArea.Default size="xs" maxH="64" scrollbar="visible">
      <Table.Root variant="surface">
        <Table.Head>
          <Table.Row>
            <Table.Header position="sticky" top="0" zIndex="docked">
              Type
            </Table.Header>
            <Table.Header position="sticky" top="0" zIndex="docked">
              Attributes
            </Table.Header>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {events.map((event, i) => (
            <EventsTableRow key={i} event={event} />
          ))}
        </Table.Body>
      </Table.Root>
    </ScrollArea.Default>
  );
}

function getEventAttributes(event: AnyEvent): string {
  const { type, ...rest } = event;
  return JSON.stringify(rest);
}

function EventsTableRow({ event }: { event: AnyEvent }) {
  return (
    <Table.Row verticalAlign="top">
      <Table.Cell>
        <Badge size="sm">{getEventTypeName(event.type)}</Badge>
      </Table.Cell>
      <Table.Cell>
        <styled.code fontSize="xs" whiteSpace="pre-wrap">
          {getEventAttributes(event)}
        </styled.code>
      </Table.Cell>
    </Table.Row>
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
