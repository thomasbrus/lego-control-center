import * as DeviceUtls from "@/lib/device/utils";
import * as HubCommands from "@/lib/hub/commands";
import * as HubUtils from "@/lib/hub/utils";
import { useCallback, useContext, useRef } from "react";
import * as DeviceCommands from "../device/commands";
import * as NotificationParsing from "../notification/parsing";
import * as PybricksCommands from "../pybricks/commands";
import { requestDeviceOptions } from "../pybricks/constants";
import { EventType } from "../pybricks/protocol";
import * as TelemetryParsing from "../telemetry/parsing";
import { TelemetryEvent } from "../telemetry/types";
import { HubsContext } from "./context";
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

  const retrieveDeviceInfo = useCallback(async (hub: Hub) => {
    DeviceUtls.assertConnected(hub.device);

    const retrievingDeviceInfoHub = replaceHub(hub.id, { ...hub, status: HubStatus.RetrievingDeviceInfo });
    const characteristic = await DeviceCommands.getPnPIdCharacteristic(hub.device);
    const value = await characteristic.readValue();
    const pnpId = DeviceUtls.decodePnpId(value);
    const type = HubUtils.getHubTypeFromPnpId(pnpId);

    return replaceHub(hub.id, { ...retrievingDeviceInfoHub, status: HubStatus.Connected, type });
  }, []);

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
      const flags = value.getUint32(2, true);
      const maxUserProgramSize = value.getUint32(6, true);
      const capabilities: HubCapabilities = { maxWriteSize, flags, maxUserProgramSize };
      const hubWithCapabilities = { ...retrievingCapabilitiesHub, status: HubStatus.Ready, capabilities };

      HubUtils.assertHasRepl(hubWithCapabilities);

      return replaceHub(hub.id, hubWithCapabilities);
    },
    [replaceHub],
  );

  const startRepl = useCallback(
    async (hub: Hub) => {
      const startingReplHub = replaceHub(hub.id, { ...hub, status: HubStatus.StartingRepl });
      await HubCommands.startRepl(hub);
      await HubCommands.waitForStdout(hub, ">>> ");

      return replaceHub(hub.id, { ...startingReplHub, status: HubStatus.Ready });
    },
    [replaceHub],
  );

  const launchDeviceDetection = useCallback(
    async (hub: Hub, options: HubCommands.ProgressOptions) => {
      DeviceUtls.assertConnected(hub.device);

      const launchingDeviceDetectionHub = replaceHub(hub.id, { ...hub, status: HubStatus.LaunchingDeviceDetection });
      await HubCommands.uploadModule(hub, "setup", options);
      await HubCommands.uploadModule(hub, "devices", options);

      return replaceHub(hub.id, { ...launchingDeviceDetectionHub, status: HubStatus.Running });
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
    retrieveDeviceInfo,
    startNotifications,
    retrieveCapabilities,
    stopNotifications,
    startRepl,
    launchDeviceDetection,
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
