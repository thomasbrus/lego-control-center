import { Hub, HubPhase } from "@/lib/hub/types";
import { TelemetryEvent } from "@/lib/telemetry/types";
import { useState } from "react";
import { Grid, styled } from "styled-system/jsx";
import { HubCard } from "./hub-card";
import { HubConnectCard } from "./hub-connect-card";
import { IMUCard } from "./imu-card";
import { LightCard } from "./light-card";
import { TelemetryCard } from "./telemetry-card";
import { TerminalCard } from "./terminal-card";

export function HubDashboard({ hub }: { hub: Hub }) {
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
    setTerminalOutput("");
    setTelemetryEvents([]);
    setLaunchProgramProgress(0);
  }

  return (
    <styled.main p="8" display="grid" gridTemplateColumns="repeat(auto-fit, minmax(420px, 1fr))" gap="6" alignItems="start">
      {hub.phase === HubPhase.Idle ? (
        <HubConnectCard
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
          <Grid gap="6">
            <HubCard hub={hub} launchProgramProgress={launchProgramProgress} />
            <IMUCard hub={hub} />

            <LightCard hub={hub} />
          </Grid>
          <Grid gap="6">
            <TerminalCard terminalOutput={terminalOutput} />
            <TelemetryCard telemetryEvents={telemetryEvents} />
          </Grid>
        </>
      )}
    </styled.main>
  );
}
