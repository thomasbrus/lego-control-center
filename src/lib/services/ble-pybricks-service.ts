import { PybricksHubCapabilities } from "../types/pybricks";
import { assertConnected } from "../utils/ble";

export const pybricksServiceUuid = "c5f50001-8280-46da-89f4-6d8051e4aeef";
const pybricksControlCharacteristicUuid = "c5f50002-8280-46da-89f4-6d8051e4aeef";
const pybricksHubCapabilitiesCharacteristicUuid = "c5f50003-8280-46da-89f4-6d8051e4aeef";

export async function getPybricksService(device: BluetoothDevice) {
  assertConnected(device);
  return device.gatt.getPrimaryService(pybricksServiceUuid);
}

export async function getPybricksControlCharacteristic(device: BluetoothDevice) {
  const pybricksService = await getPybricksService(device);
  return pybricksService.getCharacteristic(pybricksControlCharacteristicUuid);
}

export async function getPybricksHubCapabilitiesCharacteristic(device: BluetoothDevice) {
  const pybricksService = await getPybricksService(device);
  return pybricksService.getCharacteristic(pybricksHubCapabilitiesCharacteristicUuid);
}

export async function getPybricksHubCapabilities(device: BluetoothDevice): Promise<PybricksHubCapabilities> {
  const characteristic = await getPybricksHubCapabilitiesCharacteristic(device);
  const view = await characteristic.readValue();

  return {
    maxWriteSize: view.getUint16(0, true),
    flags: view.getUint32(2, true),
    maxUserProgramSize: view.getUint32(6, true),
  };
}
