import { MotorModel } from "../motor/types";

export type HubId = BluetoothDevice["id"];

export interface Hub {
  id: HubId;
  name: string;
  status: HubStatus;
  device?: BluetoothDevice;
  capabilities?: HubCapabilities;
  model?: HubModel;
}

export enum HubStatus {
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

export interface HubModel {
  hubType?: number;
  batteryPercentage?: number;
  imu?: HubIMU;
  motors?: Map<number, MotorModel>;
}

export interface HubIMU {
  pitch: number;
  roll: number;
  yaw: number;
}
