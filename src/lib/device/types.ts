import { Motor } from "../motor/types";
import { ColorDistanceSensor } from "../sensors/type";

export type ConnectedBluetoothDevice = BluetoothDevice & {
  gatt: BluetoothRemoteGATTServer & { connected: true };
};

export enum PnpIdVendorIdSource {
  BluetoothSig = 1,
  UsbImpForum = 2,
}

export type PnpId = {
  vendorIdSource: PnpIdVendorIdSource;
  vendorId: number;
  productId: number;
  productVersion: number;
};

export interface MotorDevice {
  type: "motor";
  motor: Motor;
}

export interface ColorDistanceSensorDevice {
  type: "color-distance-sensor";
  colorDistanceSensor: ColorDistanceSensor;
}

export type Device = MotorDevice | ColorDistanceSensorDevice;
export type DeviceType = Device["type"];
