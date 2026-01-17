import * as HubComponents from "@/components/hub";
import { Button, IconButton, Tabs } from "@/components/ui";
import * as HubCommands from "@/lib/hub/commands";
import { HubsProvider } from "@/lib/hub/context";
import { useHubsContext } from "@/lib/hub/hooks";
import { Hub, HubStatus } from "@/lib/hub/types";
import * as HubUtils from "@/lib/hub/utils";
import { TelemetryEvent } from "@/lib/telemetry/types";
import { createFileRoute } from "@tanstack/react-router";
import { PlusIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { styled } from "styled-system/jsx";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <HubsProvider>
      <Main />
    </HubsProvider>
  );
}

function Main() {
  const { hubs, addHub, removeHub } = useHubsContext();
  const [tab, setTab] = useState<string>(hubs[0]?.id);

  function handleAddHub() {
    const newHub: Hub = { id: crypto.randomUUID(), name: "Untitled", status: HubStatus.Idle };
    addHub(newHub);
    setTab(newHub.id);
  }

  function handleTabClose(event: React.MouseEvent, hub: Hub) {
    event.stopPropagation();
    if (HubUtils.isConnected(hub)) HubCommands.disconnect(hub);
    const originalIndex = hubs.findIndex((h) => h.id === hub.id);
    const isCurrentTab = tab === hub.id;
    const isLastTab = originalIndex === hubs.length - 1;

    if (isCurrentTab) {
      if (hubs.length === 1) {
        setTab("");
      } else if (isLastTab) {
        setTab(hubs[originalIndex - 1].id);
      } else {
        setTab(hubs[originalIndex + 1].id);
      }
    }

    removeHub(hub.id);
  }

  const closeDisabled = hubs.length <= 1;

  return (
    <div>
      <Tabs.Root value={tab} onValueChange={(details) => setTab(details.value)}>
        <Tabs.List>
          {hubs.map((hub) => (
            <Tabs.Trigger key={hub.id} value={hub.id}>
              {hub.name}
              <IconButton
                as="span"
                size="xs"
                variant="plain"
                onClick={(event) => !closeDisabled && handleTabClose(event, hub)}
                disabled={closeDisabled}
              >
                <XIcon />
              </IconButton>
            </Tabs.Trigger>
          ))}
          <Tabs.Indicator />
          <Button colorPalette="[primary]" variant="plain" onClick={handleAddHub}>
            Add
            <PlusIcon />
          </Button>
        </Tabs.List>
        {hubs.map((hub) => (
          <Tabs.Content key={hub.id} value={hub.id}>
            <HubDashboard hub={hub} />
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </div>
  );
}

function HubDashboard({ hub }: { hub: Hub }) {
  const [terminalOutput, setTerminalOutput] = useState<string>("");
  const [telemetryEvents, setTelemetryEvents] = useState<TelemetryEvent[]>([]);
  const [launchProgramProgress, setLaunchProgramProgress] = useState<number>(0);

  function handleTerminalOutput(output: string) {
    setTerminalOutput((prev) => prev + output);
  }

  function handleTelemetryEvent(event: TelemetryEvent) {
    setTelemetryEvents((prev) => [...prev, event]);
  }

  function handleLaunchProgramProgres(progress: number) {
    setLaunchProgramProgress(progress);
  }

  function handleDisconnect() {
    debugger;
    setTerminalOutput("");
    setTelemetryEvents([]);
    setLaunchProgramProgress(0);
  }

  return (
    <styled.main p="8" display="grid" gridTemplateColumns={{ md: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" }} gap="6">
      {hub.status === HubStatus.Idle ? (
        <HubComponents.ConnectCard
          hub={hub}
          title={hub.name}
          description="Let's connect this hub to get started."
          onTerminalOutput={handleTerminalOutput}
          onTelemetryEvent={handleTelemetryEvent}
          onLaunchProgramProgress={handleLaunchProgramProgres}
          onDisconnect={handleDisconnect}
        />
      ) : (
        <>
          <HubComponents.DetailsCard hub={hub} launchProgramProgress={launchProgramProgress} />
          <HubComponents.LightCard hub={hub} />
          <HubComponents.TerminalCard terminalOutput={terminalOutput} />
          <HubComponents.TelemetryCard telemetryEvents={telemetryEvents} />
        </>
      )}
    </styled.main>
  );
}
