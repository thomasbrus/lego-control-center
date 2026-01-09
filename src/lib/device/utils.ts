import { assert } from "@/lib/utils";
import { ConnectedBluetoothDevice } from "./types";

export function assertConnected(device: BluetoothDevice): asserts device is ConnectedBluetoothDevice {
  assert(!!device.gatt?.connected, "Device is not connected");
}
