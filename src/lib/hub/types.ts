import { MotorModel } from "../motor/types";

export type HubId = BluetoothDevice["id"];

export interface Hub {
  id: HubId;
  name: string;
  type?: number;
  phase: HubPhase;
  device?: BluetoothDevice;
  capabilities?: HubCapabilities;
  batteryPercentage?: number;
  motors?: Map<number, MotorModel>;
  imu?: HubIMU;
}

export enum HubPhase {
  Idle,
  Connecting,
  Connected,
  StartingNotifications,
  RetrievingCapabilities,
  StartingRepl,
  LaunchingProgram,
  Ready,
  Running,
  Error,
}

export interface HubCapabilities {
  maxWriteSize: number;
}

export interface HubIMU {
  pitch: number;
  roll: number;
  yaw: number;
}
