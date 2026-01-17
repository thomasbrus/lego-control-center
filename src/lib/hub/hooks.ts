import * as DeviceUtls from "@/lib/device/utils";
import * as HubCommands from "@/lib/hub/commands";
import * as HubUtils from "@/lib/hub/utils";
import { useCallback, useContext, useRef } from "react";
import * as NotificationParsing from "../notification/parsing";
import * as PybricksCommands from "../pybricks/commands";
import { requestDeviceOptions } from "../pybricks/constants";
import { EventType } from "../pybricks/protocol";
import * as TelemetryParsing from "../telemetry/parsing";
import { TelemetryEvent } from "../telemetry/types";
import { HubsContext } from "./context";
import { programMain1, programMain2 } from "./program";
import { Hub, HubCapabilities, HubId, HubStatus } from "./types";

export function useHub() {
  const { replaceHub, processTelemetryEvent, disconnectHub } = useHubsContext();
  const listenerRefs = useRef<Map<HubId, (event: Event) => void>>(new Map());

  const connect = useCallback(
    async (hub: Hub, options: ConnectOptions) => {
      let device: BluetoothDevice;

      try {
        device = await navigator.bluetooth.requestDevice(requestDeviceOptions);
      } catch (error) {
        if (error instanceof DOMException && error.name === "NotFoundError") return;
        throw error;
      }

      const connectingHub = replaceHub(hub.id, { ...hub, status: HubStatus.Connecting, name: device.name ?? hub.name, device });

      device.addEventListener("gattserverdisconnected", () => {
        disconnectHub(hub.id);
        options.onDisconnect();
      });

      await device.gatt?.connect();

      return replaceHub(hub.id, { ...connectingHub, status: HubStatus.Connected });
    },
    [replaceHub],
  );

  const startNotifications = useCallback(async (hub: Hub, options: StartNotificationsOptions) => {
    DeviceUtls.assertConnected(hub.device);

    const startingNotificationsHub = replaceHub(hub.id, { ...hub, status: HubStatus.StartingNotifications });
    const characteristic = await PybricksCommands.getPybricksControlCharacteristic(hub.device);

    const existingListener = listenerRefs.current.get(hub.id);

    if (existingListener) {
      characteristic.removeEventListener("characteristicvaluechanged", existingListener);
    }

    // Just to be sure, see https://github.com/pybricks/pybricks-code/blob/a4aade5a29945f55a12608b43e3e62e9e333fc03/src/ble/sagas.ts#L353-L359
    await characteristic.stopNotifications();
    await characteristic.startNotifications();

    const listener = (event: Event) => {
      const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
      const notification = value && NotificationParsing.parseNotification(value, new Date());

      if (notification) {
        if (notification.eventType === EventType.WriteStdout) {
          options.onTerminalOutput(notification.message);
        }

        if (notification.eventType === EventType.WriteAppData) {
          const telemetryEvent = TelemetryParsing.parseTelemetryEvent(notification.data);
          processTelemetryEvent(hub.id, telemetryEvent);
          options.onTelemetryEvent(telemetryEvent);
        }
      }
    };

    listenerRefs.current.set(hub.id, listener);
    characteristic.addEventListener("characteristicvaluechanged", listener);

    return replaceHub(hub.id, { ...startingNotificationsHub, status: HubStatus.Ready });
  }, []);

  const stopNotifications = useCallback(async (hub: Hub) => {
    if (!DeviceUtls.isConnected(hub.device)) return;

    const characteristic = await PybricksCommands.getPybricksControlCharacteristic(hub.device);
    await characteristic.stopNotifications();

    const listener = listenerRefs.current.get(hub.id);
    if (listener) {
      characteristic.removeEventListener("characteristicvaluechanged", listener);
      listenerRefs.current.delete(hub.id);
    }
  }, []);

  const retrieveCapabilities = useCallback(
    async (hub: Hub) => {
      DeviceUtls.assertConnected(hub.device);

      const retrievingCapabilitiesHub = replaceHub(hub.id, { ...hub, status: HubStatus.RetrievingCapabilities });
      const characteristic = await PybricksCommands.getPybricksHubCapabilitiesCharacteristic(hub.device);

      const value = await characteristic.readValue();
      const maxWriteSize = value.getUint16(0, true);
      const capabilities: HubCapabilities = { maxWriteSize };

      return replaceHub(hub.id, { ...retrievingCapabilitiesHub, status: HubStatus.Ready, capabilities });
    },
    [replaceHub],
  );

  const startRepl = useCallback(
    async (hub: Hub) => {
      const startingReplHub = replaceHub(hub.id, { ...hub, status: HubStatus.StartingRepl });
      await HubCommands.startRepl(hub);

      return replaceHub(hub.id, { ...startingReplHub, status: HubStatus.Ready });
    },
    [replaceHub],
  );

  const launchProgram = useCallback(
    async (hub: Hub, options: { onProgress: (progress: number) => void }) => {
      DeviceUtls.assertConnected(hub.device);

      const launcningProgramHub = replaceHub(hub.id, { ...hub, status: HubStatus.LaunchingProgram });

      const programs = [programMain1, programMain2];

      for (let i = 0; i < programs.length; i++) {
        function handleProgress(progress: number) {
          options?.onProgress(progress / 2 + (i / programs.length) * 100);
        }

        await HubCommands.enterPasteMode(hub);
        await HubCommands.writeStdinWithResponse(hub, programs[i], { onProgress: handleProgress });
        await HubCommands.exitPasteMode(hub);
      }

      return replaceHub(hub.id, { ...launcningProgramHub, status: HubStatus.Running });
    },
    [replaceHub],
  );

  const disconnect = useCallback(
    async (hub: Hub) => {
      if (HubUtils.isConnected(hub)) {
        await stopNotifications(hub);
        await HubCommands.disconnect(hub);
        return disconnectHub(hub.id);
      }
    },
    [replaceHub],
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

export function useHubsContext() {
  const value = useContext(HubsContext);
  if (!value) throw new Error("HubsContext missing");
  return value;
}

export type DisconnectHandler = () => void;
export type ConnectOptions = { onDisconnect: DisconnectHandler };

export type TerminalOutputHandler = (output: string) => void;
export type TelemetryEventHandler = (telemetryEvent: TelemetryEvent) => void;
export type StartNotificationsOptions = { onTerminalOutput: TerminalOutputHandler; onTelemetryEvent: TelemetryEventHandler };

export type LaunchProgramProgressHandler = (progress: number) => void;
export type LaunchProgramOptions = { onProgress: LaunchProgramProgressHandler };
