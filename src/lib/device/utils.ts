import { assert } from "@/lib/utils";
import { pybricksHubCapabilitiesCharacteristicUUID, pybricksServiceUUID } from "../pybricks/constants";
import { ConnectedBluetoothDevice } from "./types";

export function assertConnected(device: BluetoothDevice): asserts device is ConnectedBluetoothDevice {
  assert(!!device.gatt?.connected, "Device is not connected");
}

export async function getCapabilities(device: BluetoothDevice) {
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
