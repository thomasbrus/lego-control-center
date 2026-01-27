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

export interface Motor {
  state?: MotorState;
  limits?: MotorLimits;
}

export interface MotorState {
  angle: number;
  speed: number;
  load: number;
  isStalled: boolean;
}

export interface MotorLimits {
  speed: number;
  acceleration: number;
  torque: number;
}

export interface ColorDistanceSensor {
  color?: { hue: number; saturation: number; value: number };
  distance?: number;
}
