import * as DeviceUtils from "@/lib/device/utils";
import * as HubUtils from "@/lib/hub/utils";
import { useCallback, useRef } from "react";
import * as HubHooks from "../hub/hooks";
import { useHubsContext } from "../hub/hooks";
import { programMain1, programMain2 } from "../hub/program";
import { Hub, HubStatus } from "../hub/types";
import { TelemetryEvent } from "../telemetry/types";
import { delay } from "../utils";

export function useHub(): ReturnType<typeof HubHooks.useHub> {
  const { updateHub, disconnectHub } = useHubsContext();
  const onDisconnectRef = useRef<HubHooks.DisconnectHandler>(() => {});
  const onTerminalOutputRef = useRef<HubHooks.TerminalOutputHandler>(() => {});
  const onTelemetryEventRef = useRef<HubHooks.TelemetryEventHandler>(() => {});

  const connect = useCallback(
    async (hub: Hub, options: HubHooks.ConnectOptions) => {
      const connectingDevice = { gatt: { connected: false } } as BluetoothDevice;
      const connectingHub = updateHub(hub.id, {
        ...hub,
        status: HubStatus.Connecting,
        name: "Simulated Hub",
        device: connectingDevice,
      });

      onDisconnectRef.current = options.onDisconnect;

      await delay(500);

      const connectedDevice = {
        gatt: { connected: true, disconnect: () => disconnectHub(hub.id) },
      } as BluetoothDevice;

      return updateHub(hub.id, {
        ...connectingHub,
        status: HubStatus.Connected,
        device: connectedDevice,
      });
    },
    [updateHub, disconnectHub],
  );

  const startNotifications = useCallback(
    async (hub: Hub, options: HubHooks.StartNotificationsOptions) => {
      DeviceUtils.assertConnected(hub.device);

      const startingNotificationsHub = updateHub(hub.id, {
        ...hub,
        status: HubStatus.StartingNotifications,
      });

      await delay(300);

      onTerminalOutputRef.current = options.onTerminalOutput;
      onTelemetryEventRef.current = options.onTelemetryEvent;

      return updateHub(hub.id, {
        ...startingNotificationsHub,
        status: HubStatus.Ready,
      });
    },
    [updateHub],
  );

  const stopNotifications = useCallback(async (hub: Hub) => {
    if (!HubUtils.isConnected(hub)) return;

    onTerminalOutputRef.current = () => {};
    onTelemetryEventRef.current = () => {};

    await delay(0);
  }, []);

  const retrieveCapabilities = useCallback(
    async (hub: Hub) => {
      DeviceUtils.assertConnected(hub.device);

      const retrievingCapabilitiesHub = updateHub(hub.id, {
        ...hub,
        status: HubStatus.RetrievingCapabilities,
      });

      await delay(500);
      const capabilities = { maxWriteSize: 148 };

      return updateHub(hub.id, {
        ...retrievingCapabilitiesHub,
        status: HubStatus.Ready,
        capabilities,
      });
    },
    [updateHub],
  );

  const startRepl = useCallback(
    async (hub: Hub) => {
      DeviceUtils.assertConnected(hub.device);

      const startingReplHub = updateHub(hub.id, {
        ...hub,
        status: HubStatus.StartingRepl,
      });

      const program = programMain1 + programMain2;
      const programSize = program.length;
      const chunkSize = programSize / 40;

      for (let i = 0; i < programSize; i += chunkSize) {
        const chunk = program.slice(i, i + chunkSize);
        onTerminalOutputRef.current(chunk);
        await delay(100);
      }

      return updateHub(hub.id, {
        ...startingReplHub,
        status: HubStatus.Ready,
      });
    },
    [updateHub],
  );

  const launchProgram = useCallback(
    async (hub: Hub, options: HubHooks.LaunchProgramOptions) => {
      DeviceUtils.assertConnected(hub.device);

      const launchingProgramHub = updateHub(hub.id, {
        ...hub,
        status: HubStatus.LaunchingProgram,
      });

      for (let i = 0; i <= 24; i++) {
        options?.onProgress((i / 24) * 100);
        await delay(100);
      }

      const runningHub = updateHub(hub.id, {
        ...launchingProgramHub,
        status: HubStatus.Running,
      });

      const telemetryEvents: TelemetryEvent[] = [
        { type: "HubInfo", hubType: 0 },
        { type: "MotorLimits", portIndex: 0, speed: 100, acceleration: 200, torque: 50 },

        { type: "HubStatus", batteryPercentage: 69 },

        { type: "HubIMU", pitch: 13, roll: 37, yaw: 42 },
        { type: "MotorStatus", portIndex: 0, angle: 1234, speed: 56, load: 78, isStalled: false },
        { type: "SensorStatus", portIndex: 0, sensorType: 1, distance: 100, hue: 120, saturation: 80, value: 90 },

        { type: "HubIMU", pitch: 14, roll: 38, yaw: 43 },
        { type: "MotorStatus", portIndex: 0, angle: 1240, speed: 60, load: 75, isStalled: false },
        { type: "SensorStatus", portIndex: 0, sensorType: 1, distance: 98, hue: 121, saturation: 81, value: 91 },

        { type: "HubIMU", pitch: 15, roll: 39, yaw: 44 },
        { type: "MotorStatus", portIndex: 0, angle: 1250, speed: 62, load: 70, isStalled: false },
        { type: "SensorStatus", portIndex: 0, sensorType: 1, distance: 95, hue: 122, saturation: 82, value: 92 },

        { type: "HubStatus", batteryPercentage: 68 },

        { type: "HubIMU", pitch: 16, roll: 40, yaw: 45 },
        { type: "MotorStatus", portIndex: 0, angle: 1260, speed: 65, load: 68, isStalled: false },
        { type: "SensorStatus", portIndex: 0, sensorType: 1, distance: 93, hue: 123, saturation: 83, value: 93 },
      ];

      for (const event of telemetryEvents) {
        onTelemetryEventRef.current(event);
        await delay(100);
      }

      return runningHub;
    },
    [updateHub],
  );

  const disconnect = useCallback(
    async (hub: Hub) => {
      if (HubUtils.isConnected(hub)) {
        await stopNotifications(hub);
        onDisconnectRef.current();
        return disconnectHub(hub.id);
      }
    },
    [disconnectHub],
  );

  return {
    connect,
    startNotifications,
    retrieveCapabilities,
    stopNotifications,
    startRepl,
    launchProgram,
    disconnect,
  };
}
