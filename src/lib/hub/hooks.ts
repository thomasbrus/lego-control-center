import { parseEvent } from "@/lib/event/parsing";
import { disconnect, shutdown } from "@/lib/hub/actions";
import { HubsContext } from "@/lib/hub/context";
import { EventHandler, Hub, HubStatus } from "@/lib/hub/types";
import { getPybricksControlCharacteristic, startReplUserProgram } from "@/lib/pybricks/commands";
import { requestDeviceOptions } from "@/lib/pybricks/constants";
import { useCallback, useContext, useEffect, useRef } from "react";
import { getCapabilities } from "../device/utils";

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
  const { hubIds, addHub } = useHubsContext();

  const connect = useCallback(async () => {
    const id = `virtual-hub-${crypto.randomUUID()}`;
    const hub: Hub = {
      id,
      name: "Virtual Hub",
      device: {} as BluetoothDevice,
      status: HubStatus.Ready,
      capabilities: {
        maxWriteSize: 24,
      },
    };
    addHub(hub);
    return hub;
  }, [addHub]);

  return { hubIds, connect };
}

export function useHub(id: Hub["id"], options?: { onEvent?: EventHandler }) {
  const { onEvent } = options ?? {};
  const { getHub } = useHubsContext();

  const hub = getHub(id);
  const unsubscribeRef = useRef<null | (() => Promise<void>)>(null);

  useEffect(() => {
    let active = true;

    async function setupNotifications() {
      if (!hub || hub.status !== HubStatus.Ready || !onEvent) return;

      try {
        const controlCharacteristic = await getPybricksControlCharacteristic(hub.device);

        const listener = (domEvent: globalThis.Event) => {
          const target = domEvent.target as BluetoothRemoteGATTCharacteristic;
          if (!target.value) return;

          const event = parseEvent(target.value);
          if (event) onEvent(event);
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

export function useVirtualHub(id: Hub["id"], _options?: { onEvent?: EventHandler }): ReturnType<typeof useHub> {
  const { getHub } = useHubsContext();
  const hub = getHub(id);

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
  const { removeHub } = useHubsContext();

  async function disconnectHub() {
    removeHub(id);
    return Promise.resolve();
  }

  async function shutdownHub() {
    removeHub(id);
    return Promise.resolve();
  }

  return { disconnectHub, shutdownHub } as const;
}

function useHubsContext() {
  const value = useContext(HubsContext);
  if (!value) throw new Error("HubsContext missing");
  return value;
}
