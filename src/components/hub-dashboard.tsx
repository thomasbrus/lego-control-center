import { Hub, HubStatus } from "@/lib/hub/types";
import * as HubUtils from "@/lib/hub/utils";
import { TelemetryEvent } from "@/lib/telemetry/types";
import { useState } from "react";
import { Grid, styled } from "styled-system/jsx";
import { HubCard } from "./hub-card";
import { HubConnectCard } from "./hub-connect-card";
import { IMUCard } from "./imu-card";
import { LightCard } from "./light-card";
import { MotorCard } from "./motor-card";
import { SensorCard } from "./sensor-card";
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
    <styled.main p="8" pb="16" display="grid" gridTemplateColumns="repeat(auto-fit, minmax(420px, 1fr))" gap="6" alignItems="start">
      {hub.status === HubStatus.Idle ? (
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
            {HubUtils.isAtLeastStatus(hub, HubStatus.Ready) && <LightCard hub={hub} />}
          </Grid>
          {HubUtils.isAtLeastStatus(hub, HubStatus.Ready) && (
            <Grid gap="6">
              {<IMUCard hub={hub} />}
              {Array.from(hub.motors ?? []).map(([port, motor]) => (
                <MotorCard key={port} port={port} motor={motor} />
              ))}
              {Array.from(hub.sensors ?? []).map(([port, sensor]) => (
                <SensorCard key={port} port={port} sensor={sensor} />
              ))}
            </Grid>
          )}
          <Grid gap="6">
            {HubUtils.isAtLeastStatus(hub, HubStatus.Running) && <TelemetryCard telemetryEvents={telemetryEvents} />}
            {<TerminalCard terminalOutput={terminalOutput} />}
          </Grid>
        </>
      )}
    </styled.main>
  );
}
