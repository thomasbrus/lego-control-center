import * as DeviceUtils from "@/lib/device/utils";
import * as HubUtils from "@/lib/hub/utils";
import { useCallback } from "react";
import * as HubCommands from "../hub/commands";
import * as HubHooks from "../hub/hooks";
import { useHubsContext } from "../hub/hooks";
import { programMain1, programMain2 } from "../hub/program";
import { Hub, HubStatus } from "../hub/types";
import { CommandType } from "../pybricks/protocol";
import { SensorType } from "../sensor/type";
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
        status: HubStatus.Connecting,
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
        status: HubStatus.Connected,
        device: connectedDevice,
      });
    },
    [replaceHub, disconnectHub],
  );

  const retrieveDeviceInfo = useCallback(
    async (hub: Hub) => {
      const retrievingDeviceInfoHub = replaceHub(hub.id, { ...hub, status: HubStatus.RetrievingDeviceInfo });

      // Change this to simulate unsupported device
      if (Math.random() > 1) throw new Error("This device is not supported");

      const type = { id: "technic-hub", name: "Technic Hub" } as const;

      await delay(150);

      return replaceHub(hub.id, { ...retrievingDeviceInfoHub, status: HubStatus.Connected, type });
    },
    [replaceHub],
  );

  const startNotifications = useCallback(
    async (hub: Hub, options: HubHooks.StartNotificationsOptions) => {
      DeviceUtils.assertConnected(hub.device);

      const startingNotificationsHub = replaceHub(hub.id, {
        ...hub,
        status: HubStatus.StartingNotifications,
      });

      await delay(100);

      onTerminalOutputRefs.set(hub.id, options.onTerminalOutput);

      onTelemetryEventRefs.set(hub.id, (telemetryEvent) => {
        processTelemetryEvent(hub.id, telemetryEvent);
        options.onTelemetryEvent(telemetryEvent);
      });

      return replaceHub(hub.id, {
        ...startingNotificationsHub,
        status: HubStatus.Ready,
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
        status: HubStatus.RetrievingCapabilities,
      });

      await delay(500);
      const capabilities = { maxWriteSize: 148, flags: 11, maxUserProgramSize: 16164 };

      // Change this to simulate repl not supported
      if (Math.random() > 1) throw new Error("REPL not supported on this hub");

      return replaceHub(hub.id, {
        ...retrievingCapabilitiesHub,
        status: HubStatus.Ready,
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
        status: HubStatus.StartingRepl,
      });

      return replaceHub(hub.id, {
        ...startingReplHub,
        status: HubStatus.Ready,
      });
    },
    [replaceHub],
  );

  const launchProgram = useCallback(
    async (hub: Hub, options: HubHooks.LaunchProgramOptions) => {
      DeviceUtils.assertConnected(hub.device);

      const launchingProgramHub = replaceHub(hub.id, {
        ...hub,
        status: HubStatus.LaunchingProgram,
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
        status: HubStatus.Running,
      });

      const sensorType: SensorType = { id: "color-distance-sensor", name: "Color Distance Sensor" };

      const telemetryEvents: TelemetryEvent[] = [
        { type: "MotorLimits", port: 0, speed: 1000, acceleration: 200, torque: 50 },

        { type: "HubState", batteryPercentage: 78 },

        { type: "HubIMU", pitch: 13, roll: 37, heading: 42 },
        { type: "MotorState", port: 0, angle: 1234, speed: 56, load: 78, isStalled: false },
        { type: "SensorState", port: 0, sensorType, value0: 100, value1: 15, value2: 80, value3: 40 },

        { type: "HubIMU", pitch: 14, roll: 38, heading: 43 },
        { type: "MotorState", port: 0, angle: 14, speed: 60, load: 75, isStalled: false },
        { type: "SensorState", port: 0, sensorType, value0: 98, value1: 14, value2: 81, value3: 64 },

        { type: "HubIMU", pitch: 15, roll: 42, heading: 64 },
        { type: "MotorState", port: 0, angle: 14, speed: 30, load: 56, isStalled: false },
        { type: "SensorState", port: 0, sensorType, value0: 95, value1: 16, value2: 92, value3: 61 },

        { type: "HubState", batteryPercentage: 77 },

        { type: "HubIMU", pitch: 16, roll: 64, heading: 128 },
        { type: "MotorState", port: 0, angle: 14, speed: 0, load: 0, isStalled: true },
        { type: "SensorState", port: 0, sensorType, value0: 93, value1: 14, value2: 100, value3: 57 },
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
    retrieveDeviceInfo,
    startNotifications,
    retrieveCapabilities,
    stopNotifications,
    startRepl,
    launchProgram,
    disconnect,
  };
}
