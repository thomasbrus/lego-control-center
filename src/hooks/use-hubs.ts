import { HubsContext } from "@/contexts/hubs";
import { deviceInformationServiceUUID } from "@/lib/ble-device-info-service/protocol";
import { nordicUartServiceUUID } from "@/lib/ble-nordic-uart-service/protocol";
import { pybricksHubCapabilitiesCharacteristicUUID, pybricksServiceUUID } from "@/lib/ble-pybricks-service/protocol";
import { useCallback, useContext, useState } from "react";

const requestDeviceOptions = {
  filters: [{ services: [pybricksServiceUUID] }],
  optionalServices: [pybricksServiceUUID, deviceInformationServiceUUID, nordicUartServiceUUID],
};

export function useHubs() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const value = useContext(HubsContext);

  if (!value) throw new Error("HubsContext missing");

  const { hubs, addHub, removeHub } = value;

  const requestAndConnect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const device = await navigator.bluetooth.requestDevice(requestDeviceOptions);

      device.addEventListener("gattserverdisconnected", () => {
        removeHub(device.id);
      });

      await device.gatt?.connect();

      const capabilities = await getCapabilities(device);

      const hub = {
        id: device.id,
        name: device.name,
        device,
        capabilities,
      };

      addHub(hub);

      return hub;
    } catch (e) {
      if (e instanceof Error) {
        setError(e);
      } else {
        setError(new Error("Unknown error occurred"));
      }

      return null;
    } finally {
      setIsConnecting(false);
    }
  }, [addHub, removeHub]);

  return { hubs, requestAndConnect, isConnecting, error };
}

async function getCapabilities(device: BluetoothDevice) {
  if (!device.gatt?.connected) {
    throw new Error("Device is not connected");
  }

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
