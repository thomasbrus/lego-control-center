import { Badge, Button, Card, Group, Heading, Icon, ScrollArea, Select, Table, Text } from "@/components/ui";
import { ValueChangeDetails } from "@/components/ui/select";
import { enterPasteMode, exitPasteMode, writeStdinWithResponse } from "@/lib/hubs/actions";
import { HubsProvider } from "@/lib/hubs/context";
import { useHub, useHubActions, useHubs, useVirtualHub, useVirtualHubActions, useVirtualHubs } from "@/lib/hubs/hooks";
import { Hub, HubStatus } from "@/lib/hubs/types";
import { createListCollection, useScrollArea } from "@ark-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { BluetoothIcon, BracesIcon, LightbulbIcon, TerminalIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { css, Styles } from "styled-system/css";
import { Box, styled } from "styled-system/jsx";
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
  const { testing } = Route.useSearch();

  const { hub, stdout } = testing ? useVirtualHub(hubId) : useHub(hubId);
  const { disconnectHub, shutdownHub } = testing ? useVirtualHubActions(hubId) : useHubActions(hubId);

  return (
    <styled.div display="flex" flexDirection="column" gap="4">
      <DetailsCard hub={hub} disconnectHub={disconnectHub} shutdownHub={shutdownHub} />
      <StdoutCard stdout={stdout} />
      <LightCard hub={hub} />
      <DemoCard hub={hub} />
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

function DemoCard({ hub }: { hub: Hub }) {
  const disabled = hub.status !== HubStatus.Ready;

  const program = `
def say_hi():
    print("Hi there!")

say_hi()`;

  return (
    <Card.Root>
      <Card.Header flexDirection="row" justifyContent="space-between" alignItems="center" gap="4">
        <Card.Title display="flex" alignItems="center" gap="2">
          <Icon size="md">
            <BracesIcon />
          </Icon>
          Demo
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <styled.code bg="gray.2" p="2" borderRadius="l1" fontSize="sm" whiteSpace="pre-wrap">
          {"{ ... }"}
        </styled.code>
      </Card.Body>
      <Card.Footer>
        <Button disabled={disabled} variant="outline" onClick={() => enterPasteMode(hub)}>
          Enter paste mode
        </Button>
        <Button disabled={disabled} variant="outline" onClick={() => writeStdinWithResponse(hub, program)}>
          Send program
        </Button>
        <Button disabled={disabled} variant="outline" onClick={() => exitPasteMode(hub)}>
          Exit paste mode
        </Button>
      </Card.Footer>
    </Card.Root>
  );
}

function StdoutCard({ stdout }: { stdout: string }) {
  const lines = stdout.split(/\r?\n/);
  const scrollArea = useScrollArea();

  // @ts-expect-error
  window.scrollArea = scrollArea;

  useEffect(() => {
    scrollArea.scrollToEdge({ edge: "bottom" });
  }, [stdout]);

  return (
    <Card.Root>
      <Card.Header flexDirection="row" justifyContent="space-between" alignItems="center" gap="4">
        <Card.Title display="flex" alignItems="center" gap="2">
          <Icon size="md">
            <TerminalIcon />
          </Icon>
          Stdout
        </Card.Title>
      </Card.Header>
      <Card.Body display="block">
        {stdout.length === 0 ? (
          <EmptyState description="No output yet." />
        ) : (
          <ScrollArea.Default value={scrollArea} size="xs" maxH="64" scrollbar="visible">
            <styled.pre fontSize="xs" fontFamily="mono" whiteSpace="pre-wrap" wordBreak="break-all" p="2" bg="gray.2" borderRadius="l1">
              {lines.map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < lines.length - 1 && <br />}
                </React.Fragment>
              ))}
            </styled.pre>
          </ScrollArea.Default>
        )}
      </Card.Body>
    </Card.Root>
  );
}

const lightCollection = createListCollection({
  items: [
    { value: "1", label: "Black" },
    { value: "2", label: "Red" },
    { value: "3", label: "Orange" },
    { value: "4", label: "Yellow" },
    { value: "5", label: "Green" },
    { value: "6", label: "Cyan" },
    { value: "7", label: "Blue" },
    { value: "8", label: "Violet" },
    { value: "9", label: "Magenta" },
  ],
});

function LightCard({ hub }: { hub: Hub }) {
  const [light, setLight] = useState<number>(5);
  const disabled = hub.status !== HubStatus.Ready;

  function handleValueChange(details: ValueChangeDetails) {
    setLight(Number(details.value));
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
        <Select.Default
          label="Color"
          collection={lightCollection}
          disabled={disabled}
          value={[String(light)]}
          onValueChange={handleValueChange}
        >
          {lightCollection.items.map((item) => (
            <Select.Item key={item.value} item={item}>
              <Select.ItemText>{item.label}</Select.ItemText>
              <Select.ItemIndicator />
            </Select.Item>
          ))}
        </Select.Default>
      </Card.Body>
      <Card.Footer>
        <Button variant="outline">Turn off</Button>
        <Button>Apply</Button>
      </Card.Footer>
    </Card.Root>
  );
}
