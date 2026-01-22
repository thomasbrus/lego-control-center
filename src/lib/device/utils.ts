import { assert } from "@/lib/utils";
import { ConnectedBluetoothDevice, PnpId } from "./types";

export function assertConnected(device?: BluetoothDevice): asserts device is ConnectedBluetoothDevice {
  assert(isConnected(device), "Device is not connected");
}

export function isConnected(device?: BluetoothDevice): device is ConnectedBluetoothDevice {
  return device?.gatt?.connected ?? false;
}

export function decodePnpId(data: DataView): PnpId {
  return {
    vendorIdSource: data.getUint8(0),
    vendorId: data.getUint16(1, true),
    productId: data.getUint16(3, true),
    productVersion: data.getUint16(5, true),
  };
}
