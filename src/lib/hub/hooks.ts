import { assertConnected } from "@/lib/device/utils";
import { disconnect, shutdown } from "@/lib/hub/actions";
import { HubsContext } from "@/lib/hub/context";
import { Hub, HubStatus } from "@/lib/hub/types";
import { getPybricksControlCharacteristic, startReplUserProgram } from "@/lib/pybricks/commands";
import { pybricksHubCapabilitiesCharacteristicUUID, pybricksServiceUUID } from "@/lib/pybricks/constants";
import { useCallback, useContext, useRef } from "react";

const requestDeviceOptions = {
  filters: [{ services: [pybricksServiceUUID] }],
  optionalServices: [pybricksServiceUUID],
};

export type NotificationHandler = (value: DataView) => void;

export function useHubs() {
  const unsubscribeRef = useRef<Map<string, () => Promise<void>>>(new Map());

  const value = useContext(HubsContext);

  if (!value) throw new Error("HubsContext missing");

  const { hubs, addHub, removeHub, updateHubStatus } = value;

  const requestAndConnect = useCallback(
    async (onNotification?: NotificationHandler) => {
      try {
        const device = await navigator.bluetooth.requestDevice(requestDeviceOptions);

        // Create hub early with Connecting status
        const hub: Hub = {
          id: device.id,
          name: device.name,
          device,
          status: HubStatus.Connecting,
        };

        addHub(hub);

        device.addEventListener("gattserverdisconnected", async () => {
          // Clean up notifications on disconnect
          const unsubscribe = unsubscribeRef.current.get(device.id);
          if (unsubscribe) {
            await unsubscribe();
            unsubscribeRef.current.delete(device.id);
          }
          removeHub(device.id);
        });

        await device.gatt?.connect();
        updateHubStatus(device.id, HubStatus.RetrievingCapabilities);
        const capabilities = await getCapabilities(device);
        updateHubStatus(device.id, HubStatus.StartingRepl);
        await startReplUserProgram(device);

        // Set up notifications if handler is provided
        if (onNotification) {
          const controlCharacteristic = await getPybricksControlCharacteristic(device);

          const listener = (event: Event) => {
            const target = event.target as BluetoothRemoteGATTCharacteristic;
            if (target.value) {
              onNotification(target.value);
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

          unsubscribeRef.current.set(device.id, unsubscribe);
        }

        // Update hub with final status and capabilities
        const connectedHub: Hub = {
          ...hub,
          status: HubStatus.Ready,
          capabilities,
        };

        addHub(connectedHub);

        return connectedHub;
      } catch (e) {
        // User cancelled the device picker - not an error
        return null;
      }
    },
    [addHub, removeHub, updateHubStatus]
  );

  const disconnectHub = useCallback(
    async (hub: Hub) => {
      removeHub(hub.id);
      await disconnect(hub);
    },
    [removeHub]
  );

  const shutdownHub = useCallback(
    async (hub: Hub) => {
      removeHub(hub.id);
      await shutdown(hub);
    },
    [removeHub]
  );

  return { hubs, requestAndConnect, disconnectHub, shutdownHub };
}

async function getCapabilities(device: BluetoothDevice) {
  assertConnected(device);

  try {
    const primaryService = await device.gatt.getPrimaryService(pybricksServiceUUID);
    const characteristic = await primaryService.getCharacteristic(pybricksHubCapabilitiesCharacteristicUUID);

    const value = await characteristic.readValue();

    const maxWriteSize = value.getUint16(0, true);

    return { maxWriteSize };
  } catch (err) {
    throw new Error("Failed to get capabilities", { cause: err });
  }
}
