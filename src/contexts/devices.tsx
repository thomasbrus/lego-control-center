import { createContext, useState } from "react";

interface DevicesContextValue {
  devices: BluetoothDevice[];
  addDevice: (device: BluetoothDevice) => void;
  removeDevice: (id: BluetoothDevice["id"]) => void;
}

export const DevicesContext = createContext<DevicesContextValue | undefined>(undefined);

export function DevicesProvider({ children }: { children: React.ReactNode }) {
  const [devices, setDevices] = useState<Map<BluetoothDevice["id"], BluetoothDevice>>(new Map());

  function addDevice(device: BluetoothDevice) {
    setDevices((prev) => {
      const newMap = new Map(prev);
      newMap.set(device.id, device);
      return newMap;
    });
  }

  function removeDevice(id: BluetoothDevice["id"]) {
    setDevices((prev) => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }

  return (
    <DevicesContext.Provider value={{ devices: Array.from(devices.values()), addDevice, removeDevice }}>{children}</DevicesContext.Provider>
  );
}
