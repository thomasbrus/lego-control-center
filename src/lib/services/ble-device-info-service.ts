import { DeviceInfoPnpId } from "../types/device-info";
import { assertConnected } from "../utils/ble";

export const deviceInformationServiceUuid = 0x180a;
const pnpIdUuid = 0x2a50;

export async function getDeviceInfoService(device: BluetoothDevice) {
  assertConnected(device);
  return await device.gatt.getPrimaryService(deviceInformationServiceUuid);
}

export async function getPnpIdCharacteristic(device: BluetoothDevice) {
  const service = await getDeviceInfoService(device);
  return service.getCharacteristic(pnpIdUuid);
}

export async function getPnpId(device: BluetoothDevice): Promise<DeviceInfoPnpId> {
  const characteristic = await getPnpIdCharacteristic(device);
  const view = await characteristic.readValue();

  return {
    vendorIdSource: view.getUint8(0),
    vendorId: view.getUint16(1, true),
    productId: view.getUint16(3, true),
    productVersion: view.getUint16(5, true),
  };
}
