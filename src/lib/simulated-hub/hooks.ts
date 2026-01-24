import * as DeviceUtils from "@/lib/device/utils";
import * as HubUtils from "@/lib/hub/utils";
import { useCallback } from "react";
import * as HubCommands from "../hub/commands";
import * as HubHooks from "../hub/hooks";
import { useHubsContext } from "../hub/hooks";
import { Hub, HubStatus } from "../hub/types";
import { CommandType } from "../pybricks/protocol";
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

  const launchDeviceDetection = useCallback(
    async (hub: Hub, options: HubCommands.ProgressOptions) => {
      DeviceUtils.assertConnected(hub.device);

      const launchingDeviceDetectionHub = replaceHub(hub.id, { ...hub, status: HubStatus.LaunchingDeviceDetection });

      options.onProgress(0);

      for (let i = 0; i < 100; i += 5) {
        options.onProgress(i);
        await delay(50);
      }

      const runningHub = replaceHub(hub.id, { ...launchingDeviceDetectionHub, status: HubStatus.Running });

      onTelemetryEventRefs.get(hub.id)!({ type: "HubDevices", devices: ["motor", "color-distance-sensor", null, null, null, null] });

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
    launchDeviceDetection,
    disconnect,
  };
}
