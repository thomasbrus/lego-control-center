import { parseNotification } from "@/lib/events/parsing";
import { EventHandler, StatusReportEvent, WriteStdoutEvent } from "@/lib/events/types";
import { disconnect, shutdown } from "@/lib/hubs/actions";
import { HubsContext } from "@/lib/hubs/context";
import { Hub, HubStatus } from "@/lib/hubs/types";
import { getPybricksControlCharacteristic, startReplUserProgram } from "@/lib/pybricks/commands";
import { requestDeviceOptions } from "@/lib/pybricks/constants";
import { EventType } from "@/lib/pybricks/protocol";
import { useCallback, useContext, useEffect, useRef } from "react";
import { getCapabilities } from "../device/utils";
import { delay } from "../utils";

export function useHubs() {
  const { hubIds, addHub, removeHub, updateHubStatus } = useHubsContext();

  const connect = useCallback(async () => {
    try {
      const device = await navigator.bluetooth.requestDevice(requestDeviceOptions);
      const hub: Hub = { id: device.id, name: device.name, device, status: HubStatus.Connecting };

      addHub(hub);

      device.addEventListener("gattserverdisconnected", () => {
        removeHub(device.id);
      });

      await device.gatt?.connect();
      updateHubStatus(device.id, HubStatus.RetrievingCapabilities);

      const capabilities = await getCapabilities(device);
      updateHubStatus(device.id, HubStatus.StartingRepl);

      await startReplUserProgram(device);
      const connectedHub: Hub = { ...hub, status: HubStatus.Ready, capabilities };

      addHub(connectedHub);

      return connectedHub;
    } catch (e) {
      // User cancelled the device picker - not an error
      if (e instanceof DOMException && e.name === "NotFoundError") return;
      throw e;
    }
  }, [addHub, removeHub, updateHubStatus]);

  return { hubIds, connect };
}

export function useVirtualHubs(): ReturnType<typeof useHubs> {
  const { hubIds, addHub, updateHubStatus } = useHubsContext();

  const connect = useCallback(async () => {
    const id = `virtual-hub-${crypto.randomUUID()}`;
    const hub: Hub = {
      id,
      name: "Virtual Hub",
      device: {} as BluetoothDevice,
      status: HubStatus.Connecting,
      capabilities: {
        maxWriteSize: 24,
      },
    };
    addHub(hub);

    await delay(100);
    updateHubStatus(id, HubStatus.RetrievingCapabilities);

    await delay(50);
    updateHubStatus(id, HubStatus.StartingRepl);

    await delay(100);
    updateHubStatus(id, HubStatus.Ready);

    return { ...hub, status: HubStatus.Ready };
  }, [addHub, updateHubStatus]);

  return { hubIds, connect };
}

export function useHub(id: Hub["id"], options?: { onEvent?: EventHandler }) {
  const { onEvent } = options ?? {};
  const { getHub, updateHubStatusFlags } = useHubsContext();

  const hub = getHub(id);
  const unsubscribeRef = useRef<null | (() => Promise<void>)>(null);

  useEffect(() => {
    let active = true;

    async function setupNotifications() {
      if (!hub || hub.status !== HubStatus.Ready || !onEvent) return;

      try {
        const controlCharacteristic = await getPybricksControlCharacteristic(hub.device);

        const listener = (domEvent: Event) => {
          const target = domEvent.target as BluetoothRemoteGATTCharacteristic;
          if (!target.value) return;

          const event = parseNotification(target.value, new Date());

          if (event) {
            if (event.type === EventType.StatusReport) {
              updateHubStatusFlags(id, event.flags);
            }

            onEvent(event);
          }
        };

        controlCharacteristic.addEventListener("characteristicvaluechanged", listener);
        await controlCharacteristic.startNotifications();

        const unsubscribe = async () => {
          controlCharacteristic.removeEventListener("characteristicvaluechanged", listener);
          try {
            await controlCharacteristic.stopNotifications();
          } catch {
            // Ignore errors - device is likely already disconnected
          }
        };

        if (active) {
          unsubscribeRef.current = unsubscribe;
        } else {
          await unsubscribe();
        }
      } catch {
        // Swallow errors for notification setup; hub may disconnect quickly
      }
    }

    setupNotifications();

    return () => {
      active = false;
      const unsubscribe = unsubscribeRef.current;
      unsubscribeRef.current = null;
      if (unsubscribe) void unsubscribe();
    };
  }, [hub?.id, hub?.status, onEvent]);

  return { hub } as const;
}

export function useVirtualHub(id: Hub["id"], options?: { onEvent?: EventHandler }): ReturnType<typeof useHub> {
  const { onEvent } = options ?? {};
  const { getHub, updateHubStatusFlags } = useHubsContext();
  const hub = getHub(id);

  useEffect(() => {
    if (!hub || hub.status !== HubStatus.Ready || !onEvent) return;

    async function emitVirtualEvents() {
      if (!onEvent) return;

      await delay(100);

      const statusEvent1: StatusReportEvent = {
        type: EventType.StatusReport,
        flags: { BatteryLowVoltageWarning: true },
        runningProgId: 0,
        selectedSlot: 0,
        receivedAt: new Date(),
      };

      updateHubStatusFlags(id, statusEvent1.flags);
      onEvent(statusEvent1);

      await delay(50);

      const stdoutEvent1: WriteStdoutEvent = {
        type: EventType.WriteStdout,
        message: "Virtual Hub initialized\r\n",
        receivedAt: new Date(),
      };

      onEvent(stdoutEvent1);

      await delay(100);

      const statusEvent2: StatusReportEvent = {
        type: EventType.StatusReport,
        flags: { BatteryLowVoltageWarning: false },
        runningProgId: 1,
        selectedSlot: 0,
        receivedAt: new Date(),
      };

      updateHubStatusFlags(id, statusEvent2.flags);
      onEvent(statusEvent2);

      await delay(50);

      const stdoutEvent2: WriteStdoutEvent = {
        type: EventType.WriteStdout,
        message: ">>> ",
        receivedAt: new Date(),
      };

      onEvent(stdoutEvent2);

      await delay(500);

      const stdoutEvent3: WriteStdoutEvent = {
        type: EventType.WriteStdout,
        message: "print('Hello from Virtual Hub!')\r\nHello from Virtual Hub!\r\n>>> ",
        receivedAt: new Date(),
      };

      onEvent(stdoutEvent3);
    }

    emitVirtualEvents();
  }, [hub?.id, hub?.status, onEvent]);

  return { hub } as const;
}

export function useHubActions(id: Hub["id"]) {
  const { getHub, removeHub } = useHubsContext();

  const disconnectHub = useCallback(async () => {
    const hub = getHub(id);
    await disconnect(hub);
    removeHub(id);
  }, [id, getHub, removeHub]);

  const shutdownHub = useCallback(async () => {
    const hub = getHub(id);
    await shutdown(hub);
    removeHub(id);
  }, [id, getHub, removeHub]);

  return { disconnectHub, shutdownHub };
}

export function useVirtualHubActions(id: Hub["id"]): ReturnType<typeof useHubActions> {
  const { removeHub, updateHubStatus } = useHubsContext();

  const disconnectHub = useCallback(async () => {
    updateHubStatus(id, HubStatus.Disconnected);
    await delay(200);
    removeHub(id);
  }, [id, removeHub, updateHubStatus]);

  const shutdownHub = useCallback(async () => {
    updateHubStatus(id, HubStatus.Disconnected);
    await delay(300);
    removeHub(id);
  }, [id, removeHub, updateHubStatus]);

  return { disconnectHub, shutdownHub } as const;
}

function useHubsContext() {
  const value = useContext(HubsContext);
  if (!value) throw new Error("HubsContext missing");
  return value;
}
