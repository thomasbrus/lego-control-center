import { assert } from "@/lib/utils";
import { ConnectedBluetoothDevice } from "./types";

export function assertConnected(device?: BluetoothDevice): asserts device is ConnectedBluetoothDevice {
  assert(isConnected(device), "Device is not connected");
}

export function isConnected(device?: BluetoothDevice): device is ConnectedBluetoothDevice {
  return device?.gatt?.connected ?? false;
}

export function assertSupported(pnpId: { productId: number }): void {
  // See https://github.com/pybricks/pybricks-code/blob/a4aade5a29945f55a12608b43e3e62e9e333fc03/src/ble-lwp3-service/protocol.ts#L26
  assert(pnpId.productId !== 0x40, "Move Hub is not supported due to memory limitations");
}

export function decodePnpId(data: DataView) {
  return {
    vendorIdSource: data.getUint8(0),
    vendorId: data.getUint16(1, true),
    productId: data.getUint16(3, true),
    productVersion: data.getUint16(5, true),
  };
}
