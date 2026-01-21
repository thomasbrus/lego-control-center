import { deviceInformationServiceUUID } from "./protocol";
import { assertConnected } from "./utils";

export async function deviceInfoService(device: BluetoothDevice) {
  assertConnected(device);
  return await device.gatt.getPrimaryService(deviceInformationServiceUUID);
}

export async function getPnPIdCharacteristic(device: BluetoothDevice) {
  const service = await deviceInfoService(device);
  return service.getCharacteristic(0x2a50);
}
