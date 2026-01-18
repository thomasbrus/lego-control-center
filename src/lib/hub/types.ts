import { Motor } from "../motor/types";

export type HubId = BluetoothDevice["id"];

export interface Hub {
  id: HubId;
  name: string;
  phase: HubPhase;
  device?: BluetoothDevice;
  capabilities?: HubCapabilities;
  type?: HubType;
  batteryPercentage?: number;
  motors?: Map<number, Motor>;
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

export interface HubType {
  id: string;
  name: string;
}

export interface HubIMU {
  pitch: number;
  roll: number;
  heading: number;
}
