import { DevicesContext } from "@/contexts/devices";
import { useCallback, useContext, useState } from "react";

export function useDevices() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const value = useContext(DevicesContext);

  if (!value) throw new Error("DevicesContext missing");

  const { devices, addDevice, removeDevice } = value;

  const requestAndConnect = useCallback(
    async (options: RequestDeviceOptions) => {
      setIsConnecting(true);
      setError(null);

      try {
        const device = await navigator.bluetooth.requestDevice(options);

        addDevice(device);

        device.addEventListener("gattserverdisconnected", () => {
          removeDevice(device.id);
        });

        await device.gatt?.connect();

        return device;
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
    },
    [addDevice, removeDevice]
  );

  return { devices, requestAndConnect, isConnecting, error };
}
