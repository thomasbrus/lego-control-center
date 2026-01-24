import { Device } from "@/lib/device/types";
import { Hub, HubStatus } from "@/lib/hub/types";
import * as HubUtils from "@/lib/hub/utils";
import { TelemetryEvent } from "@/lib/telemetry/types";
import { useState } from "react";
import { Grid, styled } from "styled-system/jsx";
import { ColorDistanceSensorCard } from "./color-distance-sensor-card";
import { HubCard } from "./hub-card";
import { HubConnectCard } from "./hub-connect-card";
import { IMUCard } from "./imu-card";
import { LightCard } from "./light-card";
import { MotorCard } from "./motor-card";
import { TelemetryCard } from "./telemetry-card";
import { TerminalCard } from "./terminal-card";

export function HubDashboard({ hub }: { hub: Hub }) {
  const [terminalOutput, setTerminalOutput] = useState<string>("");
  const [telemetryEvents, setTelemetryEvents] = useState<TelemetryEvent[]>([]);
  const [progress, setPRogress] = useState<number>(0);

  function handleTerminalOutput(output: string) {
    setTerminalOutput((prev) => prev + output);
  }

  function handleTelemetryEvent(event: TelemetryEvent) {
    setTelemetryEvents((prev) => [...prev, event]);
  }

  function handleProgress(progress: number) {
    setPRogress(progress);
  }

  function handleDisconnect() {
    setTerminalOutput("");
    setTelemetryEvents([]);
    setPRogress(0);
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
          onProgress={handleProgress}
          onDisconnect={handleDisconnect}
        />
      ) : (
        <>
          <Grid gap="6">
            <HubCard hub={hub} progress={progress} />
            {HubUtils.isAtLeastStatus(hub, HubStatus.Ready) && <LightCard hub={hub} />}
          </Grid>
          {HubUtils.isAtLeastStatus(hub, HubStatus.Ready) && (
            <Grid gap="6">
              {<IMUCard hub={hub} />}
              {Array.from(hub.devices ?? []).map(([port, device]) => renderDevice({ port, device }))}
            </Grid>
          )}
          <Grid gap="6">
            {HubUtils.isAtLeastStatus(hub, HubStatus.Running) && <TelemetryCard telemetryEvents={telemetryEvents} />}
            {HubUtils.isAtLeastStatus(hub, HubStatus.Connected) && <TerminalCard terminalOutput={terminalOutput} />}
          </Grid>
        </>
      )}
    </styled.main>
  );
}

function renderDevice({ port, device }: { port: number; device: Device }) {
  switch (device.type) {
    case "motor":
      return <MotorCard key={port} port={port} motor={device.motor} />;
    case "color-distance-sensor":
      return <ColorDistanceSensorCard key={port} port={port} sensor={device.colorDistanceSensor} />;
    default:
      return null;
  }
}
