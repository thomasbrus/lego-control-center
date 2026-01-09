import { HubsContext } from "@/contexts/hubs";
import { assertConnected } from "@/lib/device";
import { pybricksHubCapabilitiesCharacteristicUUID, pybricksServiceUUID } from "@/lib/protocol";
import { getPybricksControlCharacteristic, startReplUserProgram } from "@/lib/pybricks";
import { useCallback, useContext, useRef, useState } from "react";

const requestDeviceOptions = {
  filters: [{ services: [pybricksServiceUUID] }],
  optionalServices: [pybricksServiceUUID],
};

export type NotificationHandler = (value: DataView) => void;

export function useHubs() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const unsubscribeRef = useRef<Map<string, () => Promise<void>>>(new Map());

  const value = useContext(HubsContext);

  if (!value) throw new Error("HubsContext missing");

  const { hubs, addHub, removeHub } = value;

  const requestAndConnect = useCallback(
    async (onNotification?: NotificationHandler) => {
      setIsConnecting(true);
      setError(null);

      try {
        const device = await navigator.bluetooth.requestDevice(requestDeviceOptions);

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
        const capabilities = await getCapabilities(device);
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

        const hub = {
          id: device.id,
          name: device.name,
          device,
          capabilities,
        };

        addHub(hub);

        return hub;
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)));
        return null;
      } finally {
        setIsConnecting(false);
      }
    },
    [addHub, removeHub]
  );

  return { hubs, requestAndConnect, isConnecting, error };
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
