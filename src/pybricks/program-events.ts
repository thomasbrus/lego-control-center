export interface PybricksProgramConnectedDevicesEvent {
  type: PybricksProgramEventType.ConnectedDevices;
  devices: (null | "motor" | "color-distance-sensor")[];
}

export enum PybricksProgramEventType {
  ConnectedDevices = "ConnectedDevices",
  State = "State",
  IMU = "IMU",
  MotorLimits = "MotorLimits",
  MotorState = "MotorState",
  ColorDistanceSensorState = "ColorDistanceSensorState",
}

export interface PybricksProgramStateEvent {
  type: PybricksProgramEventType.State;
  batteryPercentage: number;
}

export interface PybricksProgramHubIMUEvent {
  type: PybricksProgramEventType.IMU;
  pitch: number;
  roll: number;
  heading: number;
}

export interface PybricksProgramMotorLimitsEvent {
  type: PybricksProgramEventType.MotorLimits;
  port: number;
  speed: number;
  acceleration: number;
  torque: number;
}

export interface PybricksProgramMotorStateEvent {
  type: PybricksProgramEventType.MotorState;
  port: number;
  angle: number;
  speed: number;
  load: number;
  isStalled: boolean;
}

export interface PybricksProgramColorDistanceSensorStateEvent {
  type: PybricksProgramEventType.ColorDistanceSensorState;
  port: number;
  color: { hue: number; saturation: number; value: number };
  distance: number;
}

export type AnyPybricksProgramEvent =
  | PybricksProgramConnectedDevicesEvent
  | PybricksProgramStateEvent
  | PybricksProgramHubIMUEvent
  | PybricksProgramMotorLimitsEvent
  | PybricksProgramMotorStateEvent
  | PybricksProgramColorDistanceSensorStateEvent;

export function decodePybricksProgramEvent(buffer: ArrayBuffer): AnyPybricksProgramEvent {
  const view = new DataView(buffer);
  const telemetryDataType = view.getUint8(0);

  switch (telemetryDataType) {
    case 0x10:
      // [PybricksProgramEventType(B), DeviceTypeA(B), DeviceTypeB(B), DeviceTypeC(B), DeviceTypeD(B), DeviceTypeE(B), DeviceTypeF(B)]
      const devices = [...Array(6)].map((_, i) => decodeDeviceId(view.getUint8(1 + i)));
      return { type: PybricksProgramEventType.ConnectedDevices, devices };

    default:
      throw new Error("Unknown telemetry data type: " + telemetryDataType);
  }
}

function decodeDeviceId(deviceId: number) {
  return { 2: "motor" as const, 5: "color-distance-sensor" as const }[deviceId] ?? null;
}
