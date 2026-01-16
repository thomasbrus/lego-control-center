import { assert } from "@/lib/utils";
import { ConnectedBluetoothDevice } from "./types";

export function assertConnected(device?: BluetoothDevice): asserts device is ConnectedBluetoothDevice {
  assert(isConnected(device), "Device is not connected");
}

export function isConnected(device?: BluetoothDevice): device is ConnectedBluetoothDevice {
  return device?.gatt?.connected ?? false;
}
