import { assert } from "@/lib/utils";

type ConnectedBluetoothDevice = BluetoothDevice & { gatt: BluetoothRemoteGATTServer & { connected: true } };

export function assertConnected(device: BluetoothDevice): asserts device is ConnectedBluetoothDevice {
  assert(!!device.gatt?.connected, "Device is not connected");
}
