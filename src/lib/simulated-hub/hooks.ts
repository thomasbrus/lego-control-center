import * as DeviceUtils from "@/lib/device/utils";
import * as HubUtils from "@/lib/hub/utils";
import { useCallback } from "react";
import * as HubCommands from "../hub/commands";
import * as HubHooks from "../hub/hooks";
import { useHubsContext } from "../hub/hooks";
import { programMain1, programMain2 } from "../hub/program";
import { Hub, HubPhase } from "../hub/types";
import { CommandType } from "../pybricks/protocol";
import { TelemetryEvent } from "../telemetry/types";
import { delay } from "../utils";

const onDisconnectRefs = new Map<string, HubHooks.DisconnectHandler>();
const onTerminalOutputRefs = new Map<string, HubHooks.TerminalOutputHandler>();
const onTelemetryEventRefs = new Map<string, HubHooks.TelemetryEventHandler>();

export function useHub(): ReturnType<typeof HubHooks.useHub> {
  const { replaceHub, processTelemetryEvent, disconnectHub } = useHubsContext();

  const connect = useCallback(
    async (hub: Hub, options: HubHooks.ConnectOptions) => {
      const connectingDevice = { gatt: { connected: false } } as BluetoothDevice;
      const connectingHub = replaceHub(hub.id, {
        ...hub,
        phase: HubPhase.Connecting,
        name: "Simulated Hub",
        device: connectingDevice,
      });

      onDisconnectRefs.set(hub.id, options.onDisconnect);

      await delay(300);

      const writeValueWithResponse = async (value: ArrayBuffer) => {
        const bytes = new Uint8Array(value);
        if (bytes[0] === CommandType.WriteStdin && bytes[1] === HubCommands.CommandType.SHUTDOWN_HUB) {
          onDisconnectRefs.get(hub.id)?.();
          await stopNotifications(hub);
          return disconnectHub(hub.id);
        }
      };

      const getCharacteristic = async (_characteristic: BluetoothCharacteristicUUID) => {
        return { writeValueWithResponse } as BluetoothRemoteGATTCharacteristic;
      };

      const getPrimaryService = async (_service: BluetoothServiceUUID) => {
        return { getCharacteristic } as BluetoothRemoteGATTService;
      };

      const connectedDevice = {
        gatt: { connected: true, getPrimaryService, disconnect: () => disconnectHub(hub.id) },
      } as BluetoothDevice;

      return replaceHub(hub.id, {
        ...connectingHub,
        phase: HubPhase.Connected,
        device: connectedDevice,
      });
    },
    [replaceHub, disconnectHub],
  );

  const startNotifications = useCallback(
    async (hub: Hub, options: HubHooks.StartNotificationsOptions) => {
      DeviceUtils.assertConnected(hub.device);

      const startingNotificationsHub = replaceHub(hub.id, {
        ...hub,
        phase: HubPhase.StartingNotifications,
      });

      await delay(100);

      onTerminalOutputRefs.set(hub.id, options.onTerminalOutput);

      onTelemetryEventRefs.set(hub.id, (telemetryEvent) => {
        processTelemetryEvent(hub.id, telemetryEvent);
        options.onTelemetryEvent(telemetryEvent);
      });

      return replaceHub(hub.id, {
        ...startingNotificationsHub,
        phase: HubPhase.Ready,
      });
    },
    [replaceHub],
  );

  const stopNotifications = useCallback(async (hub: Hub) => {
    if (!HubUtils.isConnected(hub)) return;

    await delay(0);
  }, []);

  const retrieveCapabilities = useCallback(
    async (hub: Hub) => {
      DeviceUtils.assertConnected(hub.device);

      const retrievingCapabilitiesHub = replaceHub(hub.id, {
        ...hub,
        phase: HubPhase.RetrievingCapabilities,
      });

      await delay(500);
      const capabilities = { maxWriteSize: 148 };

      return replaceHub(hub.id, {
        ...retrievingCapabilitiesHub,
        phase: HubPhase.Ready,
        capabilities,
      });
    },
    [replaceHub],
  );

  const startRepl = useCallback(
    async (hub: Hub) => {
      DeviceUtils.assertConnected(hub.device);

      const startingReplHub = replaceHub(hub.id, {
        ...hub,
        phase: HubPhase.StartingRepl,
      });

      return replaceHub(hub.id, {
        ...startingReplHub,
        phase: HubPhase.Ready,
      });
    },
    [replaceHub],
  );

  const launchProgram = useCallback(
    async (hub: Hub, options: HubHooks.LaunchProgramOptions) => {
      DeviceUtils.assertConnected(hub.device);

      const launchingProgramHub = replaceHub(hub.id, {
        ...hub,
        phase: HubPhase.LaunchingProgram,
      });

      const program = programMain1 + programMain2;
      const programSize = program.length;
      const totalTime = 4000;
      const numChunks = 36;
      const chunkSize = programSize / numChunks;

      options.onProgress(0);

      for (let i = 0; i < numChunks; i += 1) {
        const chunk = program.slice(i * chunkSize, (i + 1) * chunkSize);
        onTerminalOutputRefs.get(hub.id)!(chunk);
        await delay(totalTime / numChunks);
        options.onProgress(((i + 1) / numChunks) * 100);
      }

      const runningHub = replaceHub(hub.id, {
        ...launchingProgramHub,
        phase: HubPhase.Running,
      });

      const telemetryEvents: TelemetryEvent[] = [
        { type: "HubInfo", hubType: { id: "technic-hub", name: "Technic Hub" } },
        { type: "MotorLimits", portIndex: 0, speed: 100, acceleration: 200, torque: 50 },

        { type: "HubPhase", batteryPercentage: 78 },

        { type: "HubIMU", pitch: 13, roll: 37, heading: 42 },
        { type: "MotorStatus", portIndex: 0, angle: 1234, speed: 56, load: 78, isStalled: false },
        { type: "SensorStatus", portIndex: 0, sensorType: 1, distance: 100, hue: 120, saturation: 80, value: 90 },

        { type: "HubIMU", pitch: 14, roll: 38, heading: 43 },
        { type: "MotorStatus", portIndex: 0, angle: 1240, speed: 60, load: 75, isStalled: false },
        { type: "SensorStatus", portIndex: 0, sensorType: 1, distance: 98, hue: 121, saturation: 81, value: 91 },

        { type: "HubIMU", pitch: 15, roll: 42, heading: 64 },
        { type: "MotorStatus", portIndex: 0, angle: 1250, speed: 62, load: 70, isStalled: false },
        { type: "SensorStatus", portIndex: 0, sensorType: 1, distance: 95, hue: 122, saturation: 82, value: 92 },

        { type: "HubPhase", batteryPercentage: 77 },

        { type: "HubIMU", pitch: 16, roll: 64, heading: 128 },
        { type: "MotorStatus", portIndex: 0, angle: 1260, speed: 65, load: 68, isStalled: false },
        { type: "SensorStatus", portIndex: 0, sensorType: 1, distance: 93, hue: 123, saturation: 83, value: 93 },
      ];

      for (const event of telemetryEvents) {
        onTelemetryEventRefs.get(hub.id)!(event);
        await delay(100);
      }

      return runningHub;
    },
    [replaceHub],
  );

  const disconnect = useCallback(
    async (hub: Hub) => {
      if (HubUtils.isConnected(hub)) {
        onDisconnectRefs.get(hub.id)?.();
        await stopNotifications(hub);
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
