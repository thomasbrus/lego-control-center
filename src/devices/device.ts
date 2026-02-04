import { Motor } from "@/motors/motor";
import { ColorDistanceSensor } from "@/sensors/color-distance-sensor";

export function getDevicePortName(port: number) {
  const names = ["A", "B", "C", "D", "E", "F"];
  return names[port];
}

export interface Device {
  type: DeviceType;
}

export enum DeviceType {
  Motor = "motor",
  ColorDistanceSensor = "color-distance-sensor",
}

export interface MotorDevice extends Device {
  type: DeviceType.Motor;
  motor: Motor;
}

export interface ColorDistanceSensorDevice extends Device {
  type: DeviceType.ColorDistanceSensor;
  colorDistanceSensor: ColorDistanceSensor;
}

export type AnyDevice = MotorDevice | ColorDistanceSensorDevice;
